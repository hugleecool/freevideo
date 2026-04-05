import { ref } from "vue";

export function useRecorder() {
  const recording = ref(false);
  const phase = ref<"idle" | "recording" | "done">("idle");

  function supportsRecording(): boolean {
    return typeof MediaRecorder !== "undefined";
  }

  /**
   * Record avatar video with audio using canvas.captureStream + MediaRecorder.
   *
   * ## Why MediaRecorder instead of WebCodecs?
   *
   * The SpatialReal SDK uses WebGL with preserveDrawingBuffer=false.
   * Manual frame capture (drawImage/VideoFrame) via setTimeout gets blank frames
   * because the buffer is cleared after compositing. canvas.captureStream()
   * hooks into the GPU compositor and captures frames reliably.
   *
   * ## A/V Sync Strategy
   *
   * 1. Pre-send SDK_LEAD_MS of audio to SDK (primes lip-sync pipeline)
   * 2. Wait for SDK to process
   * 3. Start MediaRecorder (captures canvas in real-time)
   * 4. Play TTS audio through AudioContext → MediaStreamDestination (recording only, no speakers)
   * 5. Continue sending audio to SDK with maintained lead time
   * 6. canvas.captureStream captures the lip-synced avatar in real-time
   * 7. MediaRecorder records both streams → perfect sync
   *
   * @param sendAudioToSDK callback to send PCM chunks to the avatar SDK
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

    // --- Config ---
    const SDK_CHUNK_BYTES = 32000;
    const SDK_CHUNK_INTERVAL_MS = 80;
    const SDK_LEAD_MS = 300;
    const pcmBytes = new Uint8Array(audioPcm.buffer);
    const audioDurMs = (audioPcm.length / sampleRate) * 1000;

    // --- 1. Pre-send audio to SDK for lip-sync priming ---
    let sdkOffset = 0;
    let sdkSendTimeMs = 0;
    let sdkEndSent = false;
    while (sdkOffset < pcmBytes.length && sdkSendTimeMs < SDK_LEAD_MS) {
      const end = Math.min(sdkOffset + SDK_CHUNK_BYTES, pcmBytes.length);
      sendAudioToSDK(pcmBytes.slice(sdkOffset, end).buffer, false);
      sdkOffset = end;
      sdkSendTimeMs += SDK_CHUNK_INTERVAL_MS;
    }
    // If the pre-send already drained the whole buffer (short audio case),
    // send the end-of-stream signal now. Otherwise the SDK waits forever
    // for more audio and the avatar's mouth freezes mid-sentence.
    if (sdkOffset >= pcmBytes.length) {
      sendAudioToSDK(new ArrayBuffer(0), true);
      sdkEndSent = true;
    }
    // Wait for SDK to process pre-sent audio
    await new Promise((r) => setTimeout(r, SDK_LEAD_MS));

    // --- 2. Set up audio for recording ---
    // Create AudioContext, decode PCM → AudioBuffer, route to MediaStreamDest only
    const audioCtx = new AudioContext({ sampleRate });
    const audioBuffer = audioCtx.createBuffer(1, audioPcm.length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < audioPcm.length; i++) {
      channelData[i] = audioPcm[i] / 32768;
    }

    const streamDest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    // Route to recording stream ONLY (SDK handles speaker playback)
    source.connect(streamDest);

    // --- 3. Capture canvas video stream ---
    const videoStream = canvas.captureStream(fps);

    // --- 4. Combine video + audio into MediaRecorder ---
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

    // --- 5. Start recording + audio playback + SDK chunk sending ---
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

    // Continue sending audio to SDK with lead time during recording
    const sendStartTime = performance.now();
    const sdkSendLoop = setInterval(() => {
      if (sdkOffset >= pcmBytes.length) {
        clearInterval(sdkSendLoop);
        return;
      }
      const elapsed = performance.now() - sendStartTime;
      const targetMs = elapsed + SDK_LEAD_MS;
      while (sdkOffset < pcmBytes.length && sdkSendTimeMs <= targetMs) {
        const end = Math.min(sdkOffset + SDK_CHUNK_BYTES, pcmBytes.length);
        const isLast = end >= pcmBytes.length;
        sendAudioToSDK(pcmBytes.slice(sdkOffset, end).buffer, false);
        sdkOffset = end;
        sdkSendTimeMs += SDK_CHUNK_INTERVAL_MS;
        if (isLast && !sdkEndSent) {
          sendAudioToSDK(new ArrayBuffer(0), true);
          sdkEndSent = true;
        }
      }
    }, SDK_CHUNK_INTERVAL_MS);

    // --- 6. Stop after audio finishes ---
    // Add +SDK_LEAD_MS to compensate for our pre-send priming delay, then
    // +TAIL_SILENCE_MS to capture the avatar's return-to-idle (breathing)
    // animation after the final audio chunk.
    const TAIL_SILENCE_MS = 1500;
    setTimeout(() => {
      clearInterval(sdkSendLoop);
      try { source.stop(); } catch { /* already stopped */ }
      recorder.stop();
      videoStream.getTracks().forEach((t) => t.stop());
      audioCtx.close();
    }, audioDurMs + SDK_LEAD_MS + TAIL_SILENCE_MS);

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
