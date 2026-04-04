import { ref } from "vue";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";

export function useRecorder() {
  const recording = ref(false);
  const phase = ref<"idle" | "recording" | "encoding" | "done">("idle");

  let muxer: Muxer<ArrayBufferTarget> | null = null;
  let videoEncoder: VideoEncoder | null = null;
  let audioEncoder: AudioEncoder | null = null;
  let offscreen: OffscreenCanvas | null = null;
  let offCtx: OffscreenCanvasRenderingContext2D | null = null;
  let startTime = 0;
  let targetW = 720;
  let targetH = 720;

  function supportsWebCodecs(): boolean {
    return (
      typeof VideoEncoder !== "undefined" &&
      typeof AudioEncoder !== "undefined" &&
      typeof VideoFrame !== "undefined"
    );
  }

  async function startRecording(
    canvas: HTMLCanvasElement,
    audioPcm: Int16Array,
    sampleRate = 16000,
    fps = 30,
    width = 720,
    height = 720,
  ) {
    if (!supportsWebCodecs()) {
      throw new Error("WebCodecs not supported");
    }

    targetW = width;
    targetH = height;

    // OffscreenCanvas for resizing WebGL canvas to target dimensions
    offscreen = new OffscreenCanvas(width, height);
    offCtx = offscreen.getContext("2d")!;

    const target = new ArrayBufferTarget();

    muxer = new Muxer({
      target,
      video: { codec: "avc", width, height },
      audio: { codec: "aac", numberOfChannels: 1, sampleRate },
      fastStart: "in-memory",
    });

    videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer!.addVideoChunk(chunk, meta),
      error: (e) => console.error("VideoEncoder error:", e),
    });

    videoEncoder.configure({
      codec: "avc1.42001f",
      width,
      height,
      bitrate: 2_000_000,
      framerate: fps,
    });

    audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer!.addAudioChunk(chunk, meta),
      error: (e) => console.error("AudioEncoder error:", e),
    });

    audioEncoder.configure({
      codec: "mp4a.40.2",
      numberOfChannels: 1,
      sampleRate,
      bitrate: 64_000,
    });

    // Encode audio in chunks to avoid encoder overload
    const AUDIO_CHUNK_FRAMES = sampleRate; // 1 second per chunk
    for (let offset = 0; offset < audioPcm.length; offset += AUDIO_CHUNK_FRAMES) {
      const end = Math.min(offset + AUDIO_CHUNK_FRAMES, audioPcm.length);
      const slice = audioPcm.slice(offset, end);
      const float32 = new Float32Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        float32[i] = slice[i] / 32768;
      }
      const audioData = new AudioData({
        format: "f32",
        sampleRate,
        numberOfFrames: float32.length,
        numberOfChannels: 1,
        timestamp: (offset / sampleRate) * 1_000_000, // microseconds
        data: float32,
      });
      audioEncoder.encode(audioData);
      audioData.close();
    }

    startTime = performance.now();
    recording.value = true;
    phase.value = "recording";

    // Capture frames for the duration of the audio
    const durationMs = (audioPcm.length / sampleRate) * 1000;
    const frameDuration = 1000 / fps;
    let frameIndex = 0;
    const totalFrames = Math.ceil(durationMs / frameDuration);

    return new Promise<Blob>((resolve, reject) => {
      const captureLoop = async () => {
        if (frameIndex >= totalFrames) {
          // Done capturing — finalize
          try {
            phase.value = "encoding";
            if (videoEncoder!.state === "configured") {
              await videoEncoder!.flush();
              videoEncoder!.close();
            }
            if (audioEncoder!.state === "configured") {
              await audioEncoder!.flush();
              audioEncoder!.close();
            }
            muxer!.finalize();

            const buf = (muxer!.target as ArrayBufferTarget).buffer;
            const blob = new Blob([buf], { type: "video/mp4" });

            cleanup();
            phase.value = "done";
            resolve(blob);
          } catch (e) {
            cleanup();
            reject(e);
          }
          return;
        }

        // Resize canvas → offscreen → VideoFrame
        offCtx!.drawImage(canvas, 0, 0, targetW, targetH);
        const timestamp = frameIndex * frameDuration * 1000; // microseconds
        const frame = new VideoFrame(offscreen!, { timestamp });
        videoEncoder!.encode(frame, { keyFrame: frameIndex % 30 === 0 });
        frame.close();

        frameIndex++;
        setTimeout(captureLoop, frameDuration);
      };

      captureLoop();
    });
  }

  function cleanup() {
    recording.value = false;
    videoEncoder = null;
    audioEncoder = null;
    muxer = null;
    offscreen = null;
    offCtx = null;
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    recording,
    phase,
    supportsWebCodecs,
    startRecording,
    downloadBlob,
  };
}
