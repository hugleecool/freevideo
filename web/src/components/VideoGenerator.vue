<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAvatar } from "@/composables/useAvatar";
import { useRecorder } from "@/composables/useRecorder";
import { getSessionToken, fetchTTS } from "@/lib/api";
import { VOICES, AVATARS } from "@/lib/voices";
import { useLocale } from "@/i18n/useLocale";
import { LOCALE_DEFAULT_VOICE } from "@/i18n/locales";

interface Props {
  defaultText?: string;
  defaultVoiceId?: string;
}
const props = withDefaults(defineProps<Props>(), {
  defaultText: "",
  defaultVoiceId: "",
});

const { locale, t } = useLocale();

const containerRef = ref<HTMLElement | null>(null);
const textInput = ref(props.defaultText);
const selectedVoice = ref(
  props.defaultVoiceId || LOCALE_DEFAULT_VOICE[locale.value] || VOICES[0].id,
);
const selectedAvatar = ref(AVATARS[0].id);
const charCount = computed(() => textInput.value.length);
const maxChars = 500;
const showAllAvatars = ref(false);
const visibleAvatars = computed(() =>
  showAllAvatars.value ? AVATARS : AVATARS.slice(0, 8),
);

type Stage = "idle" | "loading" | "ready" | "tts" | "speaking" | "done" | "error";
const stage = ref<Stage>("idle");
const stageMsg = ref("");
const errorMsg = ref("");
const resultBlob = ref<Blob | null>(null);

const avatar = useAvatar(containerRef);
const recorder = useRecorder();

const estimatedDuration = computed(() => {
  const chars = textInput.value.length;
  return Math.max(1, Math.ceil(chars / 4));
});

let mounted = true;

onMounted(async () => {
  stage.value = "loading";
  try {
    const { sessionToken, app_id } = await getSessionToken();
    if (!mounted) return;
    await avatar.initialize(app_id, sessionToken);
    if (!mounted) return;
    await avatar.loadAvatar(selectedAvatar.value);
    if (!mounted) return;
    stage.value = "ready";
  } catch (e: unknown) {
    if (!mounted) return;
    stage.value = "error";
    errorMsg.value = e instanceof Error ? e.message : String(e);
  }
});

onUnmounted(() => {
  mounted = false;
});

async function switchAvatar(avatarId: string) {
  if (avatarId === selectedAvatar.value) return;
  selectedAvatar.value = avatarId;
  avatar.cleanup();
  stage.value = "loading";
  try {
    const { sessionToken, app_id } = await getSessionToken();
    await avatar.initialize(app_id, sessionToken);
    await avatar.loadAvatar(avatarId);
    stage.value = "ready";
  } catch (e: unknown) {
    stage.value = "error";
    errorMsg.value = e instanceof Error ? e.message : String(e);
  }
}

async function generate() {
  const text = textInput.value.trim();
  if (!text || text.length > maxChars || stage.value === "loading") return;

  resultBlob.value = null;
  errorMsg.value = "";

  try {
    stage.value = "tts";
    stageMsg.value = t("gen_connecting");
    await avatar.startConnection();

    stageMsg.value = t("gen_generating_speech");
    const pcmBuffer = await fetchTTS(text, selectedVoice.value);
    const pcmData = new Int16Array(pcmBuffer);
    const durationSec = pcmData.length / 16000;

    stage.value = "speaking";
    stageMsg.value = `${t("gen_speaking")} (${durationSec.toFixed(0)}s)`;

    const canvas = avatar.getCanvas();
    if (!canvas) throw new Error("Canvas not found");

    const blob = await recorder.startRecording(
      canvas,
      pcmData,
      16000,
      (chunk, isEnd) => avatar.sendAudio(chunk, isEnd),
    );

    stage.value = "done";
    resultBlob.value = blob;
  } catch (e: unknown) {
    stage.value = "error";
    errorMsg.value = e instanceof Error ? e.message : String(e);
  }
}

function download() {
  if (!resultBlob.value) return;
  recorder.downloadBlob(resultBlob.value, "freevideo.webm");
}

function reset() {
  stage.value = "ready";
  stageMsg.value = "";
  errorMsg.value = "";
  resultBlob.value = null;
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    <!-- Left: Input panel -->
    <div class="bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <div>
        <textarea
          v-model="textInput"
          rows="4"
          :maxlength="maxChars"
          :placeholder="t('gen_text_placeholder')"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
          :disabled="stage === 'tts' || stage === 'speaking'"
        />
        <div class="flex justify-between mt-1.5 text-xs text-gray-400 px-1">
          <span>{{ t('gen_char_count', { count: charCount, max: maxChars }) }}</span>
          <span v-if="textInput.trim()">{{ t('gen_estimated_duration', { secs: estimatedDuration }) }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{{ t('gen_voice_label') }}</label>
          <select v-model="selectedVoice" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="v in VOICES" :key="v.id" :value="v.id">{{ v.langLabel }} · {{ v.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{{ t('gen_avatar_label') }} ({{ AVATARS.length }})</label>
          <div class="flex gap-1.5 flex-wrap">
            <button
              v-for="a in visibleAvatars"
              :key="a.id"
              @click="switchAvatar(a.id)"
              :class="['px-2.5 py-1 rounded-lg text-xs font-medium transition-all', selectedAvatar === a.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              {{ a.name }}
            </button>
            <button
              v-if="!showAllAvatars"
              @click="showAllAvatars = true"
              class="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-blue-600 hover:bg-blue-50 transition-all"
            >
              +{{ AVATARS.length - 8 }} more
            </button>
            <button
              v-else
              @click="showAllAvatars = false"
              class="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all"
            >
              Show less
            </button>
          </div>
        </div>
      </div>

      <button
        @click="stage === 'done' ? reset() : generate()"
        :disabled="(!textInput.trim() || charCount > maxChars) && stage !== 'done'"
        :class="[
          'w-full py-3.5 rounded-xl font-bold text-lg transition-all shadow-sm',
          stage === 'done'
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : stage === 'tts' || stage === 'speaking'
              ? 'bg-blue-500 text-white cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none',
        ]"
      >
        <template v-if="stage === 'done'">{{ t('gen_generate_another') }}</template>
        <template v-else-if="stage === 'tts' || stage === 'speaking'">
          <span class="inline-block animate-pulse">{{ stageMsg }}</span>
        </template>
        <template v-else>{{ t('gen_button') }}</template>
      </button>

      <button
        v-if="resultBlob"
        @click="download"
        class="w-full py-3.5 rounded-xl font-bold text-lg bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-sm flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ t('gen_download_video') }} ({{ (resultBlob.size / 1024).toFixed(0) }} KB)
      </button>

      <div v-if="errorMsg" class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
        {{ errorMsg }}
        <button @click="reset" class="ml-2 underline font-medium">{{ t('gen_try_again') }}</button>
      </div>

      <p v-if="stage === 'speaking' || stage === 'tts'" class="text-xs text-amber-600 text-center">
        {{ t('gen_no_close_hint') }}
      </p>

      <div class="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2 flex-wrap">
        <span>No sign-up</span>
        <span class="w-1 h-1 rounded-full bg-gray-300" />
        <span>No limits</span>
        <span class="w-1 h-1 rounded-full bg-gray-300" />
        <span>74+ languages</span>
        <span class="w-1 h-1 rounded-full bg-gray-300" />
        <span>Forever free</span>
      </div>
    </div>

    <!-- Right: Avatar preview -->
    <div class="flex flex-col items-center">
      <div ref="containerRef" class="w-full max-w-md aspect-square bg-white rounded-2xl shadow-lg overflow-hidden" />
      <div v-if="avatar.loading.value" class="mt-3 text-sm text-gray-400 animate-pulse">
        Loading avatar... {{ Math.round(avatar.loadProgress.value) }}%
      </div>
    </div>
  </div>
</template>
