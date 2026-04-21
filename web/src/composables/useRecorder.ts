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
   * MP4 first (better compatibility), fall back to WebM.
   */
  function pickMimeType(): string {
    const candidates = [
      "video/mp4;codecs=avc1.42E01F,mp4a.40.2", // H.264 baseline + AAC
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
   * Compute video bitrate for a target resolution.
   * Base: 2.0 Mbps at 512x512, scales with sqrt(area) and caps at 4 Mbps.
   * This matches the quality of the SDK's actual rendered content.
   */
  function bitrateFor(width: number, height: number): number {
    const base = 2_000_000;
    const baseArea = 512 * 512;
    const area = width * height;
    const scale = Math.sqrt(area / baseArea);
    return Math.round(Math.min(Math.max(base * scale, 1_000_000), 4_000_000));
  }

  /**
   * Pick recording target size: match what the user sees on page (CSS size),
   * capped at 720x720. The SDK canvas's actual buffer is usually 2x or more
   * (Retina DPR), but the displayed content wasn't rendered to benefit from
   * that resolution — exporting at buffer size produces an oversized,
   * seemingly-blurry video. CSS size aligns with SDK's intended quality.
   */
  function targetSize(canvas: HTMLCanvasElement): { w: number; h: number } {
    const cssW = canvas.offsetWidth || canvas.width;
    const cssH = canvas.offsetHeight || canvas.height;
    const MAX = 720;
    const scale = Math.min(1, MAX / Math.max(cssW, cssH));
    return {
      w: Math.round(cssW * scale),
      h: Math.round(cssH * scale),
    };
  }

  /**
   * Record avatar video with audio.
   *
   * Strategy:
   * 1. Caller pushes the TTS PCM chunks to the SDK (which plays them
   *    through its AudioContext — already tapped via installAudioTap()).
   * 2. We capture the canvas + the SDK's tapped audio stream into a
   *    single MediaRecorder. Both are driven by the SDK's own clock,
   *    so A/V sync is guaranteed by construction.
   * 3. Start recorder as soon as the SDK enters "playing" state (first
   *    frame of animation is rendered).
   *
   * @param canvas        SDK-rendered canvas
   * @param audioDurationMs   expected audio duration (used for auto-stop timer)
   * @param waitForPlaying    awaits SDK's conversationState === "playing"
   */
  async function startRecording(
    canvas: HTMLCanvasElement,
    audioDurationMs: number,
    waitForPlaying: () => Promise<void>,
  ): Promise<Blob> {
    recording.value = true;
    phase.value = "recording";

    // 1. Wait until SDK actually starts playing (lip-sync animation + audio)
    await waitForPlaying();

    // 2. Pick up the SDK's audio stream from the tap (installed at SDK init)
    const audioStream = getFirstTapStream();
    if (!audioStream) {
      throw new Error(
        "Audio tap stream unavailable — SDK has not produced any audio yet",
      );
    }

    // 3. Set up downscale pipeline:
    //    sdk canvas → <video> (via captureStream) → 2D canvas → MediaRecorder
    //    This reliably works with WebGL canvases and lets us control output size.
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

    let rafId = 0;
    const drawLoop = () => {
      // SDK canvas has an alpha channel (transparent around the avatar).
      // Fill white each frame so transparent pixels composite to pure white
      // instead of the alpha:false default (black).
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
      if (srcVideo.videoWidth > 0) {
        ctx.drawImage(srcVideo, 0, 0, outW, outH);
      }
      rafId = requestAnimationFrame(drawLoop);
    };
    rafId = requestAnimationFrame(drawLoop);

    const videoStream = outCanvas.captureStream();
    const videoBitrate = bitrateFor(outW, outH);
    console.log(
      `[recorder] canvas buffer=${canvas.width}x${canvas.height} css=${canvas.offsetWidth}x${canvas.offsetHeight} → output=${outW}x${outH} bitrate=${(videoBitrate / 1_000_000).toFixed(1)}Mbps`,
    );

    // 4. Combine and record
    const combined = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(combined, {
      mimeType,
      videoBitsPerSecond: videoBitrate,
      audioBitsPerSecond: 96_000,
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

    // 5. Stop after audio finishes + tail time for return-to-idle animation
    const TAIL_IDLE_MS = 1200;
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
