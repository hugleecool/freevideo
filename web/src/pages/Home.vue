<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAvatar } from "@/composables/useAvatar";
import { useRecorder } from "@/composables/useRecorder";
import { getSessionToken, fetchTTS } from "@/lib/api";

const containerRef = ref<HTMLElement | null>(null);
const status = ref("Ready");
const textInput = ref("Hello! This is a free talking avatar video generator powered by SpatialReal.");

const avatar = useAvatar(containerRef);
const recorder = useRecorder();

// Spike: hardcoded character ID — replace with a real one from your SpatialReal account
const CHARACTER_ID = "char_default";

const PCM_CHUNK_SIZE = 32000;
const PCM_CHUNK_INTERVAL_MS = 80;

async function initSDK() {
  status.value = "Getting session token...";
  try {
    const { sessionToken, app_id } = await getSessionToken();
    status.value = "Initializing SDK...";
    await avatar.initialize(app_id, sessionToken);
    status.value = "SDK initialized. Enter a character ID and click Load Avatar.";
  } catch (e: unknown) {
    status.value = `Init failed: ${e instanceof Error ? e.message : e}`;
  }
}

const characterInput = ref(CHARACTER_ID);

async function loadChar() {
  status.value = `Loading avatar ${characterInput.value}...`;
  try {
    await avatar.loadAvatar(characterInput.value);
    status.value = "Avatar loaded. Click Start to connect.";
  } catch (e: unknown) {
    status.value = `Load failed: ${e instanceof Error ? e.message : e}`;
  }
}

async function startAvatar() {
  status.value = "Starting avatar connection...";
  try {
    await avatar.start();
    status.value = "Avatar connected. Click Generate to test TTS + recording.";
  } catch (e: unknown) {
    status.value = `Start failed: ${e instanceof Error ? e.message : e}`;
  }
}

async function generate() {
  const text = textInput.value.trim();
  if (!text) return;

  try {
    // Step 1: TTS
    status.value = "Generating speech...";
    const pcmBuffer = await fetchTTS(text);
    const pcmData = new Int16Array(pcmBuffer);
    status.value = `TTS done: ${pcmData.length} samples (${(pcmData.length / 16000).toFixed(1)}s). Sending to avatar...`;

    // Step 2: Start recording if WebCodecs available
    const canvas = avatar.getCanvas();
    let isRecording = false;
    let animFrameId = 0;

    if (canvas && recorder.supportsWebCodecs()) {
      await recorder.startRecording(canvas, 30, canvas.width || 720, canvas.height || 720);
      recorder.encodeAudio(pcmData, 16000);
      isRecording = true;

      // Capture frames in animation loop
      const captureLoop = () => {
        if (recorder.recording.value && canvas) {
          recorder.captureFrame(canvas);
          animFrameId = requestAnimationFrame(captureLoop);
        }
      };
      animFrameId = requestAnimationFrame(captureLoop);
    }

    // Step 3: Send PCM chunks to avatar SDK
    const bytes = new Uint8Array(pcmBuffer);
    let offset = 0;

    await new Promise<void>((resolve) => {
      const sendNext = () => {
        if (offset >= bytes.length) {
          avatar.sendAudio(new ArrayBuffer(0), true);
          resolve();
          return;
        }
        const end = Math.min(offset + PCM_CHUNK_SIZE, bytes.length);
        avatar.sendAudio(bytes.slice(offset, end).buffer, false);
        offset = end;
        status.value = `Sending audio: ${Math.round((offset / bytes.length) * 100)}%`;
        setTimeout(sendNext, PCM_CHUNK_INTERVAL_MS);
      };
      sendNext();
    });

    // Step 4: Wait for avatar to finish speaking, then stop recording
    const audioDuration = (pcmData.length / 16000) * 1000;
    status.value = `Avatar speaking... (${(audioDuration / 1000).toFixed(1)}s)`;
    await new Promise((r) => setTimeout(r, audioDuration + 500));

    if (isRecording) {
      cancelAnimationFrame(animFrameId);
      const blob = await recorder.stopRecording();
      status.value = `Done! Video: ${(blob.size / 1024).toFixed(0)}KB. Downloading...`;
      recorder.downloadBlob(blob, "freevideo-output.mp4");
    } else {
      status.value = "Done! (no recording — WebCodecs not available or no canvas)";
    }
  } catch (e: unknown) {
    status.value = `Error: ${e instanceof Error ? e.message : e}`;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white p-8 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">FreeVideo — Spike Test</h1>
    <p class="text-gray-500 mb-6 text-sm">Phase 1: SDK + TTS + Video Recording validation</p>

    <!-- Status -->
    <div class="bg-gray-900 rounded-lg p-3 mb-6 text-sm font-mono">
      {{ status }}
      <span v-if="avatar.loading.value" class="text-yellow-400 ml-2">
        ({{ Math.round(avatar.loadProgress.value) }}%)
      </span>
      <span v-if="avatar.error.value" class="text-red-400 ml-2">
        Error: {{ avatar.error.value }}
      </span>
    </div>

    <!-- Controls -->
    <div class="space-y-3 mb-6">
      <button @click="initSDK" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm mr-2">
        1. Init SDK
      </button>

      <div class="flex gap-2">
        <input
          v-model="characterInput"
          placeholder="Character ID"
          class="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm flex-1"
        />
        <button @click="loadChar" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
          2. Load Avatar
        </button>
      </div>

      <button @click="startAvatar" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm mr-2">
        3. Start
      </button>

      <div class="flex gap-2">
        <textarea
          v-model="textInput"
          rows="3"
          class="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm flex-1"
        />
        <button @click="generate" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm">
          4. Generate
        </button>
      </div>
    </div>

    <!-- Avatar container -->
    <div
      ref="containerRef"
      class="w-full aspect-square max-w-[720px] bg-gray-900 rounded-lg border border-gray-800 mx-auto"
    />

    <!-- Debug info -->
    <div class="mt-4 text-xs text-gray-600 space-y-1">
      <p>Connection: {{ avatar.connectionState.value }}</p>
      <p>Conversation: {{ avatar.conversationState.value }}</p>
      <p>WebCodecs: {{ recorder.supportsWebCodecs() ? 'supported' : 'not supported' }}</p>
      <p>Canvas: {{ avatar.getCanvas() ? 'found' : 'not found' }}</p>
    </div>
  </div>
</template>
