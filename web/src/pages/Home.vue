<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAvatar } from "@/composables/useAvatar";
import { useRecorder } from "@/composables/useRecorder";
import { getSessionToken, fetchTTS } from "@/lib/api";
import { VOICES, AVATARS } from "@/lib/voices";

const containerRef = ref<HTMLElement | null>(null);
const textInput = ref("");
const selectedVoice = ref(VOICES[0].id);
const selectedAvatar = ref(AVATARS[0].id);
const charCount = computed(() => textInput.value.length);
const maxChars = 500;

type Stage = "idle" | "loading" | "ready" | "tts" | "speaking" | "recording" | "encoding" | "done" | "error";
const stage = ref<Stage>("idle");
const stageMsg = ref("");
const errorMsg = ref("");
const progress = ref(0);
const resultBlob = ref<Blob | null>(null);

const avatar = useAvatar(containerRef);
const recorder = useRecorder();

const estimatedDuration = computed(() => {
  const words = textInput.value.trim().split(/\s+/).length;
  const chars = textInput.value.length;
  // rough: ~150 words/min EN, ~4 chars/sec ZH
  const secs = Math.max(words / 2.5, chars / 4);
  return Math.ceil(secs);
});

// Init SDK + load default avatar on mount
onMounted(async () => {
  stage.value = "loading";
  stageMsg.value = "Initializing...";
  try {
    const { sessionToken, app_id } = await getSessionToken();
    await avatar.initialize(app_id, sessionToken);
    await avatar.loadAvatar(selectedAvatar.value);
    stage.value = "ready";
    stageMsg.value = "";
  } catch (e: unknown) {
    stage.value = "error";
    errorMsg.value = e instanceof Error ? e.message : String(e);
  }
});

async function switchAvatar(avatarId: string) {
  selectedAvatar.value = avatarId;
  avatar.cleanup();
  stage.value = "loading";
  stageMsg.value = "Switching avatar...";
  try {
    const { sessionToken, app_id } = await getSessionToken();
    await avatar.initialize(app_id, sessionToken);
    await avatar.loadAvatar(avatarId);
    stage.value = "ready";
    stageMsg.value = "";
  } catch (e: unknown) {
    stage.value = "error";
    errorMsg.value = e instanceof Error ? e.message : String(e);
  }
}

// Main generate flow — MUST be called from real click handler
async function generate() {
  const text = textInput.value.trim();
  if (!text || text.length > maxChars) return;
  if (stage.value !== "ready") return;

  resultBlob.value = null;
  errorMsg.value = "";

  try {
    // 1. Connect (needs user gesture for AudioContext)
    stage.value = "tts";
    stageMsg.value = "Connecting to avatar...";
    await avatar.startConnection();

    // 2. TTS
    stageMsg.value = "Generating speech...";
    progress.value = 0;
    const pcmBuffer = await fetchTTS(text, selectedVoice.value);
    const pcmData = new Int16Array(pcmBuffer);
    const durationSec = pcmData.length / 16000;

    // 3. Record video + audio in sync (recorder also sends chunks to SDK)
    stage.value = "speaking";
    stageMsg.value = `Avatar speaking (${durationSec.toFixed(1)}s)...`;

    const canvas = avatar.getCanvas();
    if (!canvas) throw new Error("Canvas not found");

    const blob = await recorder.startRecording(
      canvas,
      pcmData,
      16000,
      (chunk, isEnd) => avatar.sendAudio(chunk, isEnd),
      30,
      720,
      720,
    );

    stage.value = "done";
    stageMsg.value = `Video ready! (${(blob.size / 1024).toFixed(0)} KB)`;
    resultBlob.value = blob;
  } catch (e: unknown) {
    stage.value = "error";
    errorMsg.value = e instanceof Error ? e.message : String(e);
  }
}

function download() {
  if (!resultBlob.value) return;
  recorder.downloadBlob(resultBlob.value, "freevideo.mp4");
}

function reset() {
  stage.value = "ready";
  stageMsg.value = "";
  errorMsg.value = "";
  resultBlob.value = null;
  progress.value = 0;
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Header -->
    <header class="border-b border-gray-800 px-6 py-4">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <h1 class="text-xl font-bold">FreeVideo</h1>
        <span class="text-xs text-gray-500">Forever Free Talking AI Avatar</span>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left: Controls -->
        <div class="space-y-6">
          <!-- Text input -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Your text</label>
            <textarea
              v-model="textInput"
              rows="5"
              :maxlength="maxChars"
              placeholder="Type what you want the avatar to say..."
              class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              :disabled="stage !== 'ready' && stage !== 'idle' && stage !== 'done' && stage !== 'error'"
            />
            <div class="flex justify-between mt-1 text-xs text-gray-500">
              <span>{{ charCount }}/{{ maxChars }} chars</span>
              <span v-if="textInput.trim()">~{{ estimatedDuration }}s video</span>
            </div>
          </div>

          <!-- Voice select -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Voice</label>
            <select
              v-model="selectedVoice"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option v-for="v in VOICES" :key="v.id" :value="v.id">
                {{ v.langLabel }} — {{ v.name }}
              </option>
            </select>
          </div>

          <!-- Avatar select -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="a in AVATARS"
                :key="a.id"
                @click="switchAvatar(a.id)"
                :class="[
                  'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                  selectedAvatar === a.id
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500',
                ]"
              >
                {{ a.name }}
              </button>
            </div>
          </div>

          <!-- Generate button -->
          <button
            @click="stage === 'done' ? reset() : generate()"
            :disabled="(!textInput.trim() || charCount > maxChars) && stage !== 'done'"
            :class="[
              'w-full py-3 rounded-lg font-semibold text-lg transition-colors',
              stage === 'done'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed',
            ]"
          >
            <template v-if="stage === 'done'">✓ Generate Another</template>
            <template v-else-if="stage === 'ready' || stage === 'idle' || stage === 'error'">Generate Free Video</template>
            <template v-else>{{ stageMsg }}</template>
          </button>

          <!-- Progress bar -->
          <div v-if="stage === 'speaking'" class="w-full bg-gray-800 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-200"
              :style="{ width: `${Math.round(progress * 100)}%` }"
            />
          </div>

          <!-- Download button -->
          <button
            v-if="resultBlob"
            @click="download"
            class="w-full py-3 rounded-lg font-semibold text-lg bg-purple-600 hover:bg-purple-700 text-white"
          >
            ⬇ Download MP4 ({{ (resultBlob.size / 1024).toFixed(0) }} KB)
          </button>

          <!-- Error -->
          <div v-if="errorMsg" class="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-300">
            {{ errorMsg }}
            <button @click="reset" class="ml-2 underline">Try again</button>
          </div>

          <!-- Status hint -->
          <p v-if="stage === 'speaking' || stage === 'recording' || stage === 'encoding'" class="text-xs text-yellow-400">
            Please don't close this page while generating.
          </p>
        </div>

        <!-- Right: Avatar preview -->
        <div>
          <div
            ref="containerRef"
            class="w-full aspect-square bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
          />
          <div v-if="avatar.loading.value" class="mt-2 text-center text-sm text-gray-400">
            Loading avatar... {{ Math.round(avatar.loadProgress.value) }}%
          </div>
        </div>
      </div>

      <!-- SEO content below fold -->
      <section class="mt-16 border-t border-gray-800 pt-12 max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold mb-6">Forever Free Talking AI Avatar Video Generator</h2>
        <div class="prose prose-invert prose-sm text-gray-400 space-y-4">
          <p>
            Create professional talking avatar videos instantly — no sign-up, no watermark on free tier,
            no time limits. Just type your text, pick a voice and avatar, and download your video.
          </p>
          <h3 class="text-lg font-semibold text-gray-200">How it works</h3>
          <ol class="list-decimal list-inside space-y-1">
            <li>Type or paste the text you want the avatar to say</li>
            <li>Choose a voice and language (74+ languages supported)</li>
            <li>Select an AI avatar from our library</li>
            <li>Click Generate — your video is ready in seconds</li>
          </ol>
          <h3 class="text-lg font-semibold text-gray-200">Why FreeVideo?</h3>
          <ul class="list-disc list-inside space-y-1">
            <li>100% free — no credit card, no sign-up required</li>
            <li>74+ languages with natural-sounding voices</li>
            <li>Photorealistic AI avatars powered by SpatialReal SDK</li>
            <li>Download as MP4 — use anywhere</li>
            <li>Runs in your browser — your text stays private</li>
          </ul>
        </div>
        <p class="mt-8 text-sm text-gray-600">
          Powered by
          <a href="https://spatialreal.ai" class="text-blue-400 hover:underline" target="_blank" rel="noreferrer">SpatialReal SDK</a>
          ·
          <a href="https://fish.audio" class="text-blue-400 hover:underline" target="_blank" rel="noreferrer">Fish Audio</a>
        </p>
      </section>
    </main>
  </div>
</template>
