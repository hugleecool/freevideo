import { ref } from "vue";
import { getFirstTapStream } from "@/lib/audio-tap";

export function useRecorder() {
  const recording = ref(false);
  const phase = ref<"idle" | "recording" | "done">("idle");

  function supportsRecording(): boolean {
    return typeof MediaRecorder !== "undefined";
  }

  /**
   * Pick the best supported output format for MediaRecorder.
   * Prefer higher-profile H.264 (better detail at same bitrate),
   * then WebM fallbacks.
   */
  function pickMimeType(): string {
    const candidates = [
      "video/mp4;codecs=avc1.64001F,mp4a.40.2", // H.264 High 3.1 + AAC LC
      "video/mp4;codecs=avc1.4D401F,mp4a.40.2", // H.264 Main 3.1 + AAC LC
      "video/mp4;codecs=avc1.42E01F,mp4a.40.2", // H.264 Baseline 3.1 + AAC LC
      "video/mp4;codecs=avc1,mp4a",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    for (const t of candidates) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return "video/webm";
  }

  /**
   * Bitrate for a given resolution. Talking-head footage is sparse in
   * motion but detail-sensitive around the mouth/eyes, so we aim a bit
   * higher than "generic" bitrate ladders.
   * Base: 3 Mbps at 512x512, sqrt-scaled, cap 8 Mbps.
   */
  function bitrateFor(width: number, height: number): number {
    const base = 3_000_000;
    const baseArea = 512 * 512;
    const area = width * height;
    const scale = Math.sqrt(area / baseArea);
    return Math.round(Math.min(Math.max(base * scale, 1_500_000), 8_000_000));
  }

  /**
   * Pick recording target size. Use the SDK canvas's backing buffer size
   * (what it actually rendered into) capped at 1080. Falling back to CSS
   * size if buffer attributes are missing.
   */
  function targetSize(canvas: HTMLCanvasElement): { w: number; h: number } {
    const bufW = canvas.width || canvas.offsetWidth || 512;
    const bufH = canvas.height || canvas.offsetHeight || 512;
    const MAX = 1080;
    const scale = Math.min(1, MAX / Math.max(bufW, bufH));
    return {
      w: Math.round(bufW * scale),
      h: Math.round(bufH * scale),
    };
  }

  /**
   * Record avatar video with audio.
   *
   * Pipeline:
   *   sdkCanvas (WebGL, alpha channel)
   *     ↓ captureStream()
   *   <video> element              ← preserves alpha via MediaStream presentation
   *     ↓ drawImage(video) in rAF
   *   compositing 2D canvas (white-fill each frame)
   *     ↓ captureStream(30)
   *   MediaRecorder ← audio tap stream
   *
   * Why the `<video>` intermediate: drawImage directly from a WebGL canvas
   * with `preserveDrawingBuffer: false` (which the SDK uses) returns the
   * cleared framebuffer outside the SDK's own rAF tick — we get black
   * pixels that paint over our white fill. `<video>` bound to a
   * MediaStream from captureStream correctly delivers presented frames
   * with alpha preserved, so drawImage(video) composites properly onto
   * white.
   *
   * Known tradeoff: the `<video>` element's presentation pipeline adds
   * some lag vs. the direct audio tap, which can show up as a small A/V
   * offset in the exported file. Addressed separately.
   */
  async function startRecording(
    canvas: HTMLCanvasElement,
    audioDurationMs: number,
    waitForPlaying: () => Promise<void>,
  ): Promise<Blob> {
    recording.value = true;
    phase.value = "recording";

    // Wait for SDK to enter "playing" — by that point the AudioContext
    // has connected to destination, so the tap stream has live audio.
    await waitForPlaying();

    const audioStream = getFirstTapStream();
    if (!audioStream) {
      throw new Error(
        "Audio tap stream unavailable — SDK has not produced any audio yet",
      );
    }

    const { w: outW, h: outH } = targetSize(canvas);
    const srcStream = canvas.captureStream();

    const srcVideo = document.createElement("video");
    srcVideo.srcObject = srcStream;
    srcVideo.muted = true;
    srcVideo.playsInline = true;
    await srcVideo.play();

    const outCanvas = document.createElement("canvas");
    outCanvas.width = outW;
    outCanvas.height = outH;
    const ctx = outCanvas.getContext("2d", { alpha: false })!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    let rafId = 0;
    const drawLoop = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
      if (srcVideo.videoWidth > 0) {
        ctx.drawImage(srcVideo, 0, 0, outW, outH);
      }
      rafId = requestAnimationFrame(drawLoop);
    };
    rafId = requestAnimationFrame(drawLoop);

    const videoStream = outCanvas.captureStream(30);
    const videoBitrate = bitrateFor(outW, outH);
    console.log(
      `[recorder] canvas buffer=${canvas.width}x${canvas.height} css=${canvas.offsetWidth}x${canvas.offsetHeight} → output=${outW}x${outH} bitrate=${(videoBitrate / 1_000_000).toFixed(1)}Mbps`,
    );

    const combined = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(combined, {
      mimeType,
      videoBitsPerSecond: videoBitrate,
      audioBitsPerSecond: 128_000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const donePromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        recording.value = false;
        phase.value = "done";
        resolve(blob);
      };
    });

    recorder.start(100);

    const TAIL_IDLE_MS = 1000;
    setTimeout(() => {
      recorder.stop();
      cancelAnimationFrame(rafId);
      videoStream.getTracks().forEach((t) => t.stop());
      srcStream.getTracks().forEach((t) => t.stop());
      srcVideo.srcObject = null;
    }, audioDurationMs + TAIL_IDLE_MS);

    return donePromise;
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
    pickMimeType,
  };
}
