<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useAvatar } from "@/composables/useAvatar";
import { useRecorder } from "@/composables/useRecorder";
import { getSessionToken, fetchTTS } from "@/lib/api";
import { VOICES, AVATARS, voicesForLang } from "@/lib/voices";
import { useLocale } from "@/i18n/useLocale";
import { LOCALE_DEFAULT_VOICE, SUPPORTED_LOCALES, LOCALE_META } from "@/i18n/locales";

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
const userPickedVoice = ref(false); // flag: user manually changed voice
const selectedAvatar = ref(AVATARS[0].id);
const charCount = computed(() => textInput.value.length);
const maxChars = 500;
const showAllAvatars = ref(false);
const showAllVoices = ref(false);
const visibleAvatars = computed(() =>
  showAllAvatars.value ? AVATARS : AVATARS.slice(0, 8),
);

// Voices visible by default: only voices matching current locale.
// "Show all" reveals voices from every language.
const currentLangVoices = computed(() => voicesForLang(locale.value));
const otherLangVoices = computed(() =>
  VOICES.filter((v) => v.lang !== locale.value),
);

// Auto-switch voice when locale changes (unless user already picked one).
watch(locale, (newLocale) => {
  if (!userPickedVoice.value) {
    const defaultId = LOCALE_DEFAULT_VOICE[newLocale];
    if (defaultId) selectedVoice.value = defaultId;
  }
});

function pickVoice(id: string) {
  selectedVoice.value = id;
  userPickedVoice.value = true;
}

const currentVoice = computed(() => VOICES.find((v) => v.id === selectedVoice.value));

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

  // Reset per-generation state (done/error → fresh attempt)
  resultBlob.value = null;
  errorMsg.value = "";

  try {
    stage.value = "tts";
    stageMsg.value = t("gen_connecting");
    await avatar.startConnection();

    // If this is a subsequent generation, reset the SDK's previous-utterance
    // state. After we sent end=true last time, the SDK won't accept new audio
    // until interrupted.
    avatar.interrupt();

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

function clearError() {
  errorMsg.value = "";
  if (stage.value === "error") stage.value = "ready";
}

// Group "other voices" by language for the expanded section
const otherLangGrouped = computed(() => {
  const groups: Record<string, typeof VOICES> = {};
  for (const v of otherLangVoices.value) {
    if (!groups[v.lang]) groups[v.lang] = [];
    groups[v.lang].push(v);
  }
  // Preserve SUPPORTED_LOCALES ordering
  return SUPPORTED_LOCALES
    .filter((l) => l !== locale.value && groups[l])
    .map((l) => ({
      lang: l,
      label: LOCALE_META[l].nativeName,
      voices: groups[l],
    }));
});
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    <!-- Left: Input panel -->
    <div class="bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <!-- Text input -->
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

      <!-- Voice selector (grouped, locale-aware) -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t('gen_voice_label') }}</label>
          <span v-if="currentVoice" class="text-xs text-gray-400">
            {{ currentVoice.langLabel }} · {{ currentVoice.name }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="v in currentLangVoices"
            :key="v.id"
            @click="pickVoice(v.id)"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all border',
              selectedVoice === v.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100',
            ]"
          >
            <span :class="['text-base leading-none', selectedVoice === v.id ? 'opacity-100' : 'opacity-60']">
              {{ v.gender === 'female' ? '♀' : '♂' }}
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-sm font-medium truncate">{{ v.name }}</span>
              <span :class="['block text-xs truncate', selectedVoice === v.id ? 'text-blue-100' : 'text-gray-400']">
                {{ v.style }}
              </span>
            </span>
          </button>
        </div>

        <button
          @click="showAllVoices = !showAllVoices"
          class="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {{ showAllVoices ? '− Hide other languages' : `+ Voices in other languages (${otherLangVoices.length})` }}
        </button>

        <div v-if="showAllVoices" class="mt-3 space-y-3 max-h-64 overflow-y-auto pr-1">
          <div v-for="group in otherLangGrouped" :key="group.lang">
            <div class="text-xs font-semibold text-gray-400 mb-1.5">{{ group.label }}</div>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="v in group.voices"
                :key="v.id"
                @click="pickVoice(v.id)"
                :class="[
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all border',
                  selectedVoice === v.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100',
                ]"
              >
                <span :class="['text-base leading-none', selectedVoice === v.id ? 'opacity-100' : 'opacity-60']">
                  {{ v.gender === 'female' ? '♀' : '♂' }}
                </span>
                <span class="flex-1 min-w-0">
                  <span class="block text-sm font-medium truncate">{{ v.name }}</span>
                  <span :class="['block text-xs truncate', selectedVoice === v.id ? 'text-blue-100' : 'text-gray-400']">
                    {{ v.style }}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Avatar selector -->
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

      <button
        @click="generate()"
        :disabled="!textInput.trim() || charCount > maxChars || stage === 'tts' || stage === 'speaking' || stage === 'loading'"
        :class="[
          'w-full py-3.5 rounded-xl font-bold text-lg transition-all shadow-sm',
          stage === 'tts' || stage === 'speaking'
            ? 'bg-blue-500 text-white cursor-wait'
            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none',
        ]"
      >
        <template v-if="stage === 'tts' || stage === 'speaking'">
          <span class="inline-block animate-pulse">{{ stageMsg }}</span>
        </template>
        <template v-else-if="stage === 'done'">{{ t('gen_generate_another') }}</template>
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
        <button @click="clearError" class="ml-2 underline font-medium">{{ t('gen_try_again') }}</button>
      </div>

      <p v-if="stage === 'speaking' || stage === 'tts'" class="text-xs text-amber-600 text-center">
        {{ t('gen_no_close_hint') }}
      </p>
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
