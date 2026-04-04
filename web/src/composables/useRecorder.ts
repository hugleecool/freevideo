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
   * Instead of encoding audio upfront, this function captures video frames
   * AND feeds audio to the muxer in lockstep, both driven by the same
   * wall-clock timer. This ensures the audio and video timestamps match
   * what's actually shown on the canvas (avatar lip-sync).
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

    // Audio chunk sending config (matches SDK's expected pace)
    const SDK_CHUNK_BYTES = 32000;
    const SDK_CHUNK_INTERVAL = 80; // ms
    const pcmBytes = new Uint8Array(audioPcm.buffer);
    let sdkOffset = 0;

    // Audio encoding config (encode in sync with frame timestamps)
    const AUDIO_CHUNK_SAMPLES = Math.round(OUTPUT_SAMPLE_RATE / fps); // ~1470 samples per frame
    let audioSampleOffset = 0;

    const GOP = fps * 2;
    const frameDuration = Math.round(1000 / fps);

    // Frame-by-frame loop: capture video + encode matching audio + send SDK chunks
    for (let i = 0; i < totalFrames; i++) {
      const timeMs = i * (1000 / fps);
      const timeUs = Math.round((i * 1_000_000) / fps);

      // 1. Capture video frame
      offCtx.drawImage(canvas, 0, 0, width, height);
      const frame = new VideoFrame(offscreen, { timestamp: timeUs });
      videoEncoder.encode(frame, { keyFrame: i % GOP === 0 });
      frame.close();

      // 2. Encode matching audio slice (keeps audio in lockstep with video)
      const audioEnd = Math.min(audioSampleOffset + AUDIO_CHUNK_SAMPLES, resampled.length);
      if (audioSampleOffset < resampled.length) {
        const slice = resampled.slice(audioSampleOffset, audioEnd);
        const ad = new AudioData({
          format: "f32-planar",
          sampleRate: OUTPUT_SAMPLE_RATE,
          numberOfFrames: slice.length,
          numberOfChannels: 1,
          timestamp: timeUs,
          data: slice,
        });
        audioEncoder.encode(ad);
        ad.close();
        audioSampleOffset = audioEnd;
      }

      // 3. Send SDK audio chunks at the right pace
      while (sdkOffset < pcmBytes.length && (sdkOffset / SDK_CHUNK_BYTES) * SDK_CHUNK_INTERVAL <= timeMs) {
        const end = Math.min(sdkOffset + SDK_CHUNK_BYTES, pcmBytes.length);
        const isLast = end >= pcmBytes.length;
        sendAudioToSDK(pcmBytes.slice(sdkOffset, end).buffer, false);
        sdkOffset = end;
        if (isLast) {
          sendAudioToSDK(new ArrayBuffer(0), true);
        }
      }

      await new Promise((r) => setTimeout(r, frameDuration));
    }

    // Finalize
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
