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
   * Compute a sensible video bitrate based on canvas resolution.
   * Base: 6 Mbps at 720x720. Scales by sqrt(pixels) so 4x area doesn't 4x bitrate.
   */
  function bitrateFor(width: number, height: number): number {
    const base = 6_000_000;
    const baseArea = 720 * 720;
    const area = Math.max(width * height, baseArea);
    const scale = Math.sqrt(area / baseArea);
    // Clamp so we don't explode on ultra-high-DPI canvases
    return Math.round(Math.min(base * scale, 12_000_000));
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

    // 3. Capture canvas at its native refresh rate (default browser-chosen)
    const videoStream = canvas.captureStream();

    // 4. Log actual capture dimensions for diagnostics
    const actualW = canvas.width;
    const actualH = canvas.height;
    const videoBitrate = bitrateFor(actualW, actualH);
    console.log(
      `[recorder] canvas=${actualW}x${actualH} dpr=${window.devicePixelRatio} bitrate=${(videoBitrate / 1_000_000).toFixed(1)}Mbps`,
    );

    // 5. Combine and record
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

    // 6. Stop after audio finishes + tail time for return-to-idle animation
    const TAIL_IDLE_MS = 1200;
    setTimeout(() => {
      recorder.stop();
      videoStream.getTracks().forEach((t) => t.stop());
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
