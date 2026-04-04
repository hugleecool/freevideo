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
    if (srcRate === dstRate) {
      const out = new Float32Array(pcm.length);
      for (let i = 0; i < pcm.length; i++) out[i] = pcm[i] / 32768;
      return out;
    }
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

  async function startRecording(
    canvas: HTMLCanvasElement,
    audioPcm: Int16Array,
    sampleRate = 16000,
    fps = 30,
    width = 720,
    height = 720,
  ): Promise<Blob> {
    if (!supportsRecording()) {
      throw new Error("WebCodecs not supported");
    }

    recording.value = true;
    phase.value = "recording";

    const offscreen = new OffscreenCanvas(width, height);
    const offCtx = offscreen.getContext("2d")!;

    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: "avc", width, height },
      audio: {
        codec: "aac",
        numberOfChannels: 1,
        sampleRate: OUTPUT_SAMPLE_RATE,
      },
      fastStart: "in-memory",
    });

    // --- Video encoder (Main profile for broad compatibility)
    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => console.error("VideoEncoder error:", e),
    });
    videoEncoder.configure({
      codec: "avc1.4d0020",
      width,
      height,
      bitrate: 2_000_000,
      framerate: fps,
    });

    // --- Audio encoder (44100 Hz AAC for universal playback)
    const audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => console.error("AudioEncoder error:", e),
    });
    audioEncoder.configure({
      codec: "mp4a.40.2",
      numberOfChannels: 1,
      sampleRate: OUTPUT_SAMPLE_RATE,
      bitrate: 128_000,
    });

    // Resample and encode ALL audio, then flush before video
    const resampled = resampleToFloat32(audioPcm, sampleRate, OUTPUT_SAMPLE_RATE);
    const CHUNK_SIZE = OUTPUT_SAMPLE_RATE;
    for (let off = 0; off < resampled.length; off += CHUNK_SIZE) {
      const end = Math.min(off + CHUNK_SIZE, resampled.length);
      const slice = resampled.slice(off, end);
      const ad = new AudioData({
        format: "f32-planar",
        sampleRate: OUTPUT_SAMPLE_RATE,
        numberOfFrames: slice.length,
        numberOfChannels: 1,
        timestamp: Math.round((off / OUTPUT_SAMPLE_RATE) * 1_000_000),
        data: slice,
      });
      audioEncoder.encode(ad);
      ad.close();
    }
    await audioEncoder.flush();
    audioEncoder.close();

    // Encode video frames sequentially
    const audioDurMs = (resampled.length / OUTPUT_SAMPLE_RATE) * 1000;
    const totalFrames = Math.ceil(audioDurMs / (1000 / fps));
    const GOP = fps * 2;
    const frameDuration = Math.round(1000 / fps);

    for (let i = 0; i < totalFrames; i++) {
      offCtx.drawImage(canvas, 0, 0, width, height);
      const timestamp = Math.round((i * 1_000_000) / fps);
      const frame = new VideoFrame(offscreen, { timestamp });
      videoEncoder.encode(frame, { keyFrame: i % GOP === 0 });
      frame.close();
      await new Promise((r) => setTimeout(r, frameDuration));
    }

    phase.value = "encoding";
    await videoEncoder.flush();
    videoEncoder.close();
    muxer.finalize();

    const buf = target.buffer;
    const blob = new Blob([buf], { type: "video/mp4" });

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
    // Delay revocation so the browser has time to start the download
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
