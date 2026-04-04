import { ref } from "vue";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";

export function useRecorder() {
  const recording = ref(false);
  const phase = ref<"idle" | "recording" | "encoding" | "done">("idle");

  const OUTPUT_SAMPLE_RATE = 44100;

  function supportsRecording(): boolean {
    return (
      typeof VideoEncoder !== "undefined" &&
      typeof AudioEncoder !== "undefined" &&
      typeof VideoFrame !== "undefined"
    );
  }

  function resampleToFloat32(
    pcm: Int16Array,
    srcRate: number,
    dstRate: number,
  ): Float32Array {
    const ratio = srcRate / dstRate;
    const outLen = Math.round(pcm.length / ratio);
    const out = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const srcIdx = i * ratio;
      const lo = Math.floor(srcIdx);
      const hi = Math.min(lo + 1, pcm.length - 1);
      const frac = srcIdx - lo;
      out[i] = (pcm[lo] * (1 - frac) + pcm[hi] * frac) / 32768;
    }
    return out;
  }

  /**
   * Record canvas + audio in sync.
   *
   * ## A/V Sync Strategy
   *
   * The SpatialReal SDK has inherent network latency in its lip-sync pipeline:
   *   PCM chunk → server → animation data → render on canvas
   *
   * This means if we send audio and capture the canvas simultaneously, the
   * lip animation will lag behind the audio by the SDK's processing delay.
   *
   * To fix this, we use a "pre-send" strategy:
   *
   * 1. **Pre-send phase**: Before recording starts, we send the first few
   *    hundred milliseconds of audio to the SDK and wait for it to process.
   *    This "primes" the lip-sync pipeline.
   *
   * 2. **Recording phase**: During recording, SDK audio is sent AHEAD of the
   *    video capture timeline by `SDK_LEAD_MS`. This ensures that when we
   *    capture frame N, the SDK has already received and (mostly) processed
   *    the audio corresponding to that frame.
   *
   * 3. **Audio offset**: The audio track in the MP4 starts at timestamp 0
   *    but corresponds to the same wall-clock moment as the video. Since the
   *    SDK was pre-fed, the canvas lip-sync at frame N matches the audio at
   *    frame N.
   *
   * 4. **Stable timing**: We use performance.now() to compensate for encoding
   *    overhead, preventing timestamp drift from setTimeout inaccuracy.
   *
   * @param sendAudioToSDK - callback to send PCM chunks to avatar SDK for lip-sync
   */
  async function startRecording(
    canvas: HTMLCanvasElement,
    audioPcm: Int16Array,
    sampleRate: number,
    sendAudioToSDK: (chunk: ArrayBuffer, isEnd: boolean) => void,
    fps = 30,
    width = 720,
    height = 720,
  ): Promise<Blob> {
    if (!supportsRecording()) throw new Error("WebCodecs not supported");

    recording.value = true;
    phase.value = "recording";

    const offscreen = new OffscreenCanvas(width, height);
    const offCtx = offscreen.getContext("2d")!;

    // Resample audio for AAC encoding
    const resampled = resampleToFloat32(audioPcm, sampleRate, OUTPUT_SAMPLE_RATE);
    const audioDurSec = resampled.length / OUTPUT_SAMPLE_RATE;
    const totalFrames = Math.ceil(audioDurSec * fps);

    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: "avc", width, height },
      audio: { codec: "aac", numberOfChannels: 1, sampleRate: OUTPUT_SAMPLE_RATE },
      fastStart: "in-memory",
    });

    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => console.error("VideoEncoder:", e),
    });
    videoEncoder.configure({
      codec: "avc1.4d0020",
      width,
      height,
      bitrate: 2_000_000,
      framerate: fps,
    });

    const audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => console.error("AudioEncoder:", e),
    });
    audioEncoder.configure({
      codec: "mp4a.40.2",
      numberOfChannels: 1,
      sampleRate: OUTPUT_SAMPLE_RATE,
      bitrate: 128_000,
    });

    // --- SDK audio chunk config ---
    const SDK_CHUNK_BYTES = 32000;  // 32000 bytes = 1s of PCM16 mono 16kHz
    const SDK_CHUNK_INTERVAL_MS = 80;
    const pcmBytes = new Uint8Array(audioPcm.buffer);

    // --- A/V Sync: SDK lead time ---
    // The SDK needs time to process audio and render lip-sync animation.
    // We pre-send audio chunks to the SDK ahead of the recording timeline
    // so that by the time we capture a frame, the lip animation is ready.
    //
    // SDK_LEAD_MS: How far ahead (in ms) we send audio to the SDK relative
    // to the current video frame's logical time. This should roughly match
    // the SDK's end-to-end lip-sync latency (network + processing + render).
    // 300ms is a reasonable default; can be tuned per deployment.
    const SDK_LEAD_MS = 300;

    // --- Pre-send phase ---
    // Send SDK_LEAD_MS worth of audio chunks before we start capturing frames.
    // This primes the SDK's lip-sync pipeline so frame 0 already has lip animation.
    let sdkSendTimeMs = 0; // Logical "time" of the next SDK chunk to send
    let sdkOffset = 0;

    const preSendEndMs = SDK_LEAD_MS;
    while (sdkOffset < pcmBytes.length && sdkSendTimeMs < preSendEndMs) {
      const end = Math.min(sdkOffset + SDK_CHUNK_BYTES, pcmBytes.length);
      sendAudioToSDK(pcmBytes.slice(sdkOffset, end).buffer, false);
      sdkOffset = end;
      sdkSendTimeMs += SDK_CHUNK_INTERVAL_MS;
    }

    // Wait for the SDK to process the pre-sent audio
    await new Promise((r) => setTimeout(r, SDK_LEAD_MS));

    // --- Audio encoding config ---
    const AUDIO_CHUNK_SAMPLES = Math.round(OUTPUT_SAMPLE_RATE / fps);
    let audioSampleOffset = 0;

    const GOP = fps * 2;
    const frameDurationMs = 1000 / fps;

    // --- Frame-by-frame recording loop ---
    // Use performance.now() for stable timing to avoid setTimeout drift.
    const loopStartTime = performance.now();

    for (let i = 0; i < totalFrames; i++) {
      const frameTimeUs = Math.round((i * 1_000_000) / fps);
      const frameTimeMs = i * frameDurationMs;

      // 1. Send SDK audio chunks with lead time.
      // The SDK should receive audio for time (frameTimeMs + SDK_LEAD_MS).
      // sdkSendTimeMs tracks how far ahead we've already sent.
      const sdkTargetMs = frameTimeMs + SDK_LEAD_MS;
      while (sdkOffset < pcmBytes.length && sdkSendTimeMs <= sdkTargetMs) {
        const end = Math.min(sdkOffset + SDK_CHUNK_BYTES, pcmBytes.length);
        const isLast = end >= pcmBytes.length;
        sendAudioToSDK(pcmBytes.slice(sdkOffset, end).buffer, false);
        sdkOffset = end;
        sdkSendTimeMs += SDK_CHUNK_INTERVAL_MS;
        if (isLast) {
          sendAudioToSDK(new ArrayBuffer(0), true);
        }
      }

      // 2. Capture video frame from the canvas.
      // The canvas now shows lip-sync for audio around frameTimeMs because
      // we pre-sent audio SDK_LEAD_MS ahead.
      offCtx.drawImage(canvas, 0, 0, width, height);
      const frame = new VideoFrame(offscreen, { timestamp: frameTimeUs });
      videoEncoder.encode(frame, { keyFrame: i % GOP === 0 });
      frame.close();

      // 3. Encode the matching audio slice for this frame.
      // Audio timestamps align with video timestamps (both start at 0).
      const audioEnd = Math.min(audioSampleOffset + AUDIO_CHUNK_SAMPLES, resampled.length);
      if (audioSampleOffset < resampled.length) {
        const slice = resampled.slice(audioSampleOffset, audioEnd);
        const ad = new AudioData({
          format: "f32-planar",
          sampleRate: OUTPUT_SAMPLE_RATE,
          numberOfFrames: slice.length,
          numberOfChannels: 1,
          timestamp: frameTimeUs,
          data: slice,
        });
        audioEncoder.encode(ad);
        ad.close();
        audioSampleOffset = audioEnd;
      }

      // 4. Wait for the next frame, compensating for work done this iteration.
      // This prevents timing drift from encoding overhead accumulating.
      const elapsed = performance.now() - loopStartTime;
      const nextFrameTargetMs = (i + 1) * frameDurationMs;
      const sleepMs = Math.max(0, nextFrameTargetMs - elapsed);
      if (sleepMs > 0) {
        await new Promise((r) => setTimeout(r, sleepMs));
      }
    }

    // --- Finalize ---
    phase.value = "encoding";
    await videoEncoder.flush();
    videoEncoder.close();
    await audioEncoder.flush();
    audioEncoder.close();
    muxer.finalize();

    const blob = new Blob([target.buffer], { type: "video/mp4" });
    recording.value = false;
    phase.value = "done";
    return blob;
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return {
    recording,
    phase,
    supportsRecording,
    startRecording,
    downloadBlob,
  };
}
