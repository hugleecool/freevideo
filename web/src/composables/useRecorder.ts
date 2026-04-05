import { ref } from "vue";

export function useRecorder() {
  const recording = ref(false);
  const phase = ref<"idle" | "recording" | "done">("idle");

  function supportsRecording(): boolean {
    return typeof MediaRecorder !== "undefined";
  }

  /**
   * Record avatar video with audio.
   *
   * SDK audio delivery strategy (per SpatialReal SDK Mode docs):
   * - Break PCM into 200ms chunks
   * - Send chunks back-to-back, no pacing (server buffers)
   * - Mark final chunk with isEnd=true (triggers avatar's return-to-idle)
   * - Give SDK a ~250ms head start so canvas animation is ready when
   *   the recorded audio playback starts
   *
   * @param sendAudioToSDK callback to forward a chunk to the avatar SDK
   */
  async function startRecording(
    canvas: HTMLCanvasElement,
    audioPcm: Int16Array,
    sampleRate: number,
    sendAudioToSDK: (chunk: ArrayBuffer, isEnd: boolean) => void,
    fps = 30,
  ): Promise<Blob> {
    recording.value = true;
    phase.value = "recording";

    const pcmBytes = new Uint8Array(audioPcm.buffer);
    const audioDurMs = (audioPcm.length / sampleRate) * 1000;

    // --- 1. Send ALL audio chunks to SDK upfront (per SDK docs)
    // 200ms chunks = 6400 bytes at 16kHz PCM16 mono
    const CHUNK_MS = 200;
    const CHUNK_BYTES = (sampleRate * (CHUNK_MS / 1000) * 2); // 2 bytes/sample
    for (let off = 0; off < pcmBytes.length; off += CHUNK_BYTES) {
      const end = Math.min(off + CHUNK_BYTES, pcmBytes.length);
      const isLast = end >= pcmBytes.length;
      sendAudioToSDK(pcmBytes.slice(off, end).buffer, isLast);
    }

    // --- 2. Give SDK a head start so its lip-sync catches up with audio
    const SDK_HEAD_START_MS = 250;
    await new Promise((r) => setTimeout(r, SDK_HEAD_START_MS));

    // --- 3. Set up local audio playback → MediaStreamDestination (recording only)
    const audioCtx = new AudioContext({ sampleRate });
    const audioBuffer = audioCtx.createBuffer(1, audioPcm.length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < audioPcm.length; i++) {
      channelData[i] = audioPcm[i] / 32768;
    }

    const streamDest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(streamDest);

    // --- 4. Combine canvas + audio into MediaRecorder
    const videoStream = canvas.captureStream(fps);
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...streamDest.stream.getAudioTracks(),
    ]);

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 2_500_000,
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
    source.start(0);

    // --- 5. Stop after audio finishes + tail time for return-to-idle animation
    const TAIL_IDLE_MS = 1200;
    setTimeout(() => {
      try { source.stop(); } catch { /* already stopped */ }
      recorder.stop();
      videoStream.getTracks().forEach((t) => t.stop());
      audioCtx.close();
    }, audioDurMs + TAIL_IDLE_MS);

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
  };
}
