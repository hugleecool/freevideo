import { ref } from "vue";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";

export function useRecorder() {
  const recording = ref(false);
  const progress = ref(0);

  let muxer: Muxer<ArrayBufferTarget> | null = null;
  let videoEncoder: VideoEncoder | null = null;
  let audioEncoder: AudioEncoder | null = null;
  let frameCount = 0;
  let startTime = 0;

  function supportsWebCodecs(): boolean {
    return typeof VideoEncoder !== "undefined" && typeof AudioEncoder !== "undefined";
  }

  async function startRecording(
    canvas: HTMLCanvasElement,
    fps = 30,
    width = 720,
    height = 720,
  ) {
    if (!supportsWebCodecs()) {
      throw new Error("WebCodecs not supported in this browser");
    }

    const target = new ArrayBufferTarget();

    muxer = new Muxer({
      target,
      video: {
        codec: "avc",
        width,
        height,
      },
      audio: {
        codec: "aac",
        numberOfChannels: 1,
        sampleRate: 16000,
      },
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
      sampleRate: 16000,
      bitrate: 64_000,
    });

    frameCount = 0;
    startTime = performance.now();
    recording.value = true;
  }

  function captureFrame(canvas: HTMLCanvasElement) {
    if (!videoEncoder || !recording.value) return;
    const timestamp = (performance.now() - startTime) * 1000; // microseconds
    const frame = new VideoFrame(canvas, { timestamp });
    videoEncoder.encode(frame);
    frame.close();
    frameCount++;
  }

  function encodeAudio(pcmData: Int16Array, sampleRate = 16000) {
    if (!audioEncoder || !recording.value) return;

    // Convert Int16 to Float32
    const float32 = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32[i] = pcmData[i] / 32768;
    }

    const audioData = new AudioData({
      format: "f32-planar",
      sampleRate,
      numberOfFrames: float32.length,
      numberOfChannels: 1,
      timestamp: 0,
      data: float32,
    });

    audioEncoder.encode(audioData);
    audioData.close();
  }

  async function stopRecording(): Promise<Blob> {
    recording.value = false;

    if (videoEncoder) {
      await videoEncoder.flush();
      videoEncoder.close();
      videoEncoder = null;
    }

    if (audioEncoder) {
      await audioEncoder.flush();
      audioEncoder.close();
      audioEncoder = null;
    }

    muxer!.finalize();
    const buffer = (muxer!.target as ArrayBufferTarget).buffer;
    muxer = null;

    return new Blob([buffer], { type: "video/mp4" });
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
    progress,
    supportsWebCodecs,
    startRecording,
    captureFrame,
    encodeAudio,
    stopRecording,
    downloadBlob,
  };
}
