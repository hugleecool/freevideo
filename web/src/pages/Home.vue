<script setup lang="ts">
// Force HMR refresh
import { ref, computed, onMounted } from "vue";
import { useHead } from "@unhead/vue/legacy";
import { useAvatar } from "@/composables/useAvatar";
import { useRecorder } from "@/composables/useRecorder";
import { getSessionToken, fetchTTS } from "@/lib/api";
import { VOICES, AVATARS } from "@/lib/voices";

// --- SEO Head ---
useHead({
  title: "Free AI Talking Avatar Video Generator — Forever Free, No Sign-up",
  meta: [
    { name: "description", content: "Create talking avatar videos for free. Type your text, pick an AI avatar, and download a video in seconds. 74+ languages, no sign-up, forever free. Powered by SpatialReal SDK." },
    { property: "og:title", content: "FreeVideo — Forever Free AI Talking Avatar Video Generator" },
    { property: "og:description", content: "Type text, get a talking AI avatar video. 74+ languages, forever free, no sign-up required." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "FreeVideo",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web Browser",
        description: "Forever free AI talking avatar video generator. Type text, select a voice and avatar, generate and download a talking video.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }),
    },
  ],
});

// --- State ---
const containerRef = ref<HTMLElement | null>(null);
const textInput = ref("");
const selectedVoice = ref(VOICES[0].id);
const selectedAvatar = ref(AVATARS[0].id);
const charCount = computed(() => textInput.value.length);
const maxChars = 500;
const showAllAvatars = ref(false);
const visibleAvatars = computed(() => showAllAvatars.value ? AVATARS : AVATARS.slice(0, 8));

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

// --- Init SDK on mount ---
onMounted(async () => {
  stage.value = "loading";
  try {
    const { sessionToken, app_id } = await getSessionToken();
    await avatar.initialize(app_id, sessionToken);
    await avatar.loadAvatar(selectedAvatar.value);
    stage.value = "ready";
  } catch (e: unknown) {
    stage.value = "error";
    errorMsg.value = e instanceof Error ? e.message : String(e);
  }
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
    stageMsg.value = "Connecting...";
    await avatar.startConnection();

    stageMsg.value = "Generating speech...";
    const pcmBuffer = await fetchTTS(text, selectedVoice.value);
    const pcmData = new Int16Array(pcmBuffer);
    const durationSec = pcmData.length / 16000;

    stage.value = "speaking";
    stageMsg.value = `Generating video (${durationSec.toFixed(0)}s)...`;

    const canvas = avatar.getCanvas();
    if (!canvas) throw new Error("Canvas not found");

    const blob = await recorder.startRecording(
      canvas, pcmData, 16000,
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

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fa] text-gray-900">
    <!-- Nav -->
    <nav class="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" class="text-xl font-bold tracking-tight text-gray-900">FreeVideo</a>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <a href="#how-it-works" class="hover:text-gray-900 hidden sm:block">How it works</a>
          <a href="#use-cases" class="hover:text-gray-900 hidden sm:block">Use cases</a>
          <a href="https://spatialreal.ai" target="_blank" rel="noreferrer" class="hover:text-gray-900">API</a>
        </div>
      </div>
    </nav>

    <!-- Hero: Tool is the hero -->
    <section class="min-h-[calc(100vh-3.5rem)] flex items-center">
      <div class="max-w-6xl mx-auto px-6 py-12 w-full">
        <div class="text-center mb-10">
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            AI Talking Avatar Video Generator
          </h1>
          <p class="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
            Type your text, pick a voice &amp; avatar, get a video.
            <span class="inline-flex items-center ml-2 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-semibold">
              Forever Free
            </span>
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <!-- Left: Input panel -->
          <div class="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div>
              <textarea
                v-model="textInput"
                rows="4"
                :maxlength="maxChars"
                placeholder="Type what you want the avatar to say..."
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
                :disabled="stage === 'tts' || stage === 'speaking'"
              />
              <div class="flex justify-between mt-1.5 text-xs text-gray-400 px-1">
                <span>{{ charCount }}/{{ maxChars }}</span>
                <span v-if="textInput.trim()">~{{ estimatedDuration }}s video</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Voice</label>
                <select v-model="selectedVoice" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option v-for="v in VOICES" :key="v.id" :value="v.id">{{ v.langLabel }} · {{ v.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Avatar ({{ AVATARS.length }})</label>
                <div class="flex gap-1.5 flex-wrap">
                  <button v-for="a in visibleAvatars" :key="a.id" @click="switchAvatar(a.id)"
                    :class="['px-2.5 py-1 rounded-lg text-xs font-medium transition-all', selectedAvatar === a.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
                    {{ a.name }}
                  </button>
                  <button v-if="!showAllAvatars" @click="showAllAvatars = true"
                    class="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-blue-600 hover:bg-blue-50 transition-all">
                    +{{ AVATARS.length - 8 }} more
                  </button>
                  <button v-else @click="showAllAvatars = false"
                    class="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
                    Show less
                  </button>
                </div>
              </div>
            </div>

            <button @click="stage === 'done' ? reset() : generate()"
              :disabled="(!textInput.trim() || charCount > maxChars) && stage !== 'done'"
              :class="['w-full py-3.5 rounded-xl font-bold text-lg transition-all shadow-sm',
                stage === 'done' ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : stage === 'tts' || stage === 'speaking' ? 'bg-blue-500 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none']">
              <template v-if="stage === 'done'">Generate Another Video</template>
              <template v-else-if="stage === 'tts' || stage === 'speaking'"><span class="inline-block animate-pulse">{{ stageMsg }}</span></template>
              <template v-else>Generate Free Video</template>
            </button>

            <button v-if="resultBlob" @click="download"
              class="w-full py-3.5 rounded-xl font-bold text-lg bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-sm flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download Video ({{ (resultBlob.size / 1024).toFixed(0) }} KB)
            </button>

            <div v-if="errorMsg" class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {{ errorMsg }}
              <button @click="reset" class="ml-2 underline font-medium">Try again</button>
            </div>

            <p v-if="stage === 'speaking' || stage === 'tts'" class="text-xs text-amber-600 text-center">
              Please don't close this page while generating.
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
      </div>
    </section>

    <!-- Wave -->
    <div class="h-16 bg-[#f7f9fa]">
      <svg viewBox="0 0 1440 64" fill="none" class="w-full h-full" preserveAspectRatio="none">
        <path d="M0 32C240 64 480 0 720 32C960 64 1200 0 1440 32V64H0V32Z" fill="white" />
      </svg>
    </div>

    <!-- How it works -->
    <section id="how-it-works" class="bg-white py-20">
      <div class="max-w-5xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-center mb-12">Create a talking video in 3 steps</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="step in [
            { n: '1', title: 'Type your text', desc: 'Enter what you want the avatar to say. Supports 74+ languages with natural-sounding AI voices.' },
            { n: '2', title: 'Pick a voice & avatar', desc: 'Choose from 6 realistic voices and 28 photorealistic AI avatars. Mix and match freely.' },
            { n: '3', title: 'Generate & download', desc: 'Click Generate. Your video is ready in seconds. Download and use it anywhere — no watermark, no limits.' },
          ]" :key="step.n" class="text-center">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">{{ step.n }}</div>
            <h3 class="font-semibold text-lg mb-2">{{ step.title }}</h3>
            <p class="text-gray-500 text-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Use cases -->
    <section id="use-cases" class="py-20 bg-[#f7f9fa]">
      <div class="max-w-5xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-center mb-4">Use it for anything</h2>
        <p class="text-gray-500 text-center mb-12 max-w-2xl mx-auto">Whether you're creating content for social media, training materials, or product demos — FreeVideo makes it effortless.</p>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="uc in [
            { icon: '📢', label: 'Marketing Videos' },
            { icon: '🎓', label: 'Training & Education' },
            { icon: '🛒', label: 'E-commerce' },
            { icon: '📱', label: 'Social Media' },
            { icon: '🏠', label: 'Real Estate' },
            { icon: '💼', label: 'Sales Pitches' },
          ]" :key="uc.label" class="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-2xl mb-2">{{ uc.icon }}</div>
            <div class="font-medium text-sm">{{ uc.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why free -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-3xl font-bold mb-6">Why is it forever free?</h2>
        <p class="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          FreeVideo is powered by <a href="https://spatialreal.ai" class="text-blue-600 hover:underline font-medium" target="_blank" rel="noreferrer">SpatialReal</a> — the world's most affordable real-time AI avatar infrastructure. We built FreeVideo to show what's possible. No credit card. No sign-up. No catch.
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="stat in [
            { value: '74+', label: 'Languages' },
            { value: '28', label: 'AI Avatars' },
            { value: '$0', label: 'Forever' },
            { value: '0', label: 'Sign-up needed' },
          ]" :key="stat.label" class="bg-gray-50 rounded-xl p-5">
            <div class="text-2xl font-bold text-blue-600">{{ stat.value }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-20 bg-[#f7f9fa]">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
        <div class="space-y-4">
          <details v-for="faq in [
            { q: 'Is FreeVideo really free?', a: 'Yes, forever. No trial period, no credit card, no hidden fees. Generate unlimited videos at no cost.' },
            { q: 'Do I need to sign up?', a: 'No. Just visit the site, type your text, and generate a video. No account required.' },
            { q: 'What languages are supported?', a: 'Over 74 languages including English, Chinese, Japanese, Korean, Spanish, French, German, and more.' },
            { q: 'Can I use the videos commercially?', a: 'Yes. Videos generated with FreeVideo can be used for any purpose, including commercial use.' },
            { q: 'How does it work?', a: 'Your text is converted to speech using Fish Audio AI. The speech drives a photorealistic avatar powered by SpatialReal SDK. The video is recorded in your browser and downloaded directly.' },
            { q: 'Is my text private?', a: 'Yes. The video is rendered entirely in your browser. Your text is only sent to the TTS service to generate speech.' },
          ]" :key="faq.q" class="bg-white rounded-xl shadow-sm">
            <summary class="px-5 py-4 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">{{ faq.q }}</summary>
            <p class="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{{ faq.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- Second CTA -->
    <section class="py-16 bg-white">
      <div class="max-w-2xl mx-auto px-6 text-center">
        <h2 class="text-2xl font-bold mb-4">Ready to create your first video?</h2>
        <p class="text-gray-500 mb-6">No sign-up. No limits. Just scroll up and start typing.</p>
        <button @click="scrollToTop" class="inline-flex items-center px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors shadow-sm">
          Generate Free Video
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 class="text-white font-semibold text-sm mb-3">Product</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#how-it-works" class="hover:text-white">How it works</a></li>
              <li><a href="#use-cases" class="hover:text-white">Use cases</a></li>
              <li><a href="#faq" class="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold text-sm mb-3">Developers</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="https://docs.spatialreal.ai" target="_blank" rel="noreferrer" class="hover:text-white">SpatialReal SDK</a></li>
              <li><a href="https://fish.audio" target="_blank" rel="noreferrer" class="hover:text-white">Fish Audio TTS</a></li>
              <li><a href="https://github.com/hugleecool/freevideo" target="_blank" rel="noreferrer" class="hover:text-white">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold text-sm mb-3">Alternatives</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white">vs HeyGen</a></li>
              <li><a href="#" class="hover:text-white">vs Synthesia</a></li>
              <li><a href="#" class="hover:text-white">vs D-ID</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold text-sm mb-3">Company</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="https://spatialreal.ai" target="_blank" rel="noreferrer" class="hover:text-white">SpatialReal</a></li>
              <li><a href="mailto:lihang@spatialwalk.net" class="hover:text-white">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>Powered by <a href="https://spatialreal.ai" class="text-blue-400 hover:underline" target="_blank" rel="noreferrer">SpatialReal</a> · Contact: <a href="mailto:lihang@spatialwalk.net" class="text-blue-400 hover:underline">lihang@spatialwalk.net</a></span>
          <span>&copy; 2026 FreeVideo. All rights reserved.</span>
        </div>
      </div>
    </footer>
  </div>
</template>
