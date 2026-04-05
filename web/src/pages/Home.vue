<script setup lang="ts">
import { useHead } from "@unhead/vue/legacy";
import VideoGenerator from "@/components/VideoGenerator.vue";
import SiteFooter from "@/components/SiteFooter.vue";

// --- SEO Head ---
useHead({
  title: "Free AI Talking Avatar Video Generator — Forever Free, No Sign-up",
  meta: [
    { name: "description", content: "Create talking avatar videos for free. Type your text, pick an AI avatar, and download a video in seconds. 74+ languages, no sign-up, forever free. Powered by SpatialReal SDK." },
    { property: "og:title", content: "FreeVideo — Forever Free AI Talking Avatar Video Generator" },
    { property: "og:description", content: "Type text, get a talking AI avatar video. 74+ languages, forever free, no sign-up required." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://freevideo-3gk.pages.dev/" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  link: [
    { rel: "canonical", href: "https://freevideo-3gk.pages.dev/" },
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
        url: "https://freevideo-3gk.pages.dev/",
      }),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to create an AI talking avatar video",
        step: [
          { "@type": "HowToStep", name: "Type your text", text: "Enter what you want the avatar to say (up to 500 characters)." },
          { "@type": "HowToStep", name: "Pick voice and avatar", text: "Choose from 6 voices and 28 photorealistic AI avatars." },
          { "@type": "HowToStep", name: "Generate and download", text: "Click Generate. Your video is ready in seconds. Download the MP4." },
        ],
      }),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Is FreeVideo really free?", acceptedAnswer: { "@type": "Answer", text: "Yes, forever. No trial period, no credit card, no hidden fees. Generate unlimited videos at no cost." } },
          { "@type": "Question", name: "Do I need to sign up?", acceptedAnswer: { "@type": "Answer", text: "No. Just visit the site, type your text, and generate a video. No account required." } },
          { "@type": "Question", name: "What languages are supported?", acceptedAnswer: { "@type": "Answer", text: "Over 74 languages including English, Chinese, Japanese, Korean, Spanish, French, German, and more." } },
          { "@type": "Question", name: "Can I use the videos commercially?", acceptedAnswer: { "@type": "Answer", text: "Yes. Videos generated with FreeVideo can be used for any purpose, including commercial use." } },
        ],
      }),
    },
  ],
});

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
          <a href="/use-cases/marketing-video" class="hover:text-gray-900 hidden sm:block">Use cases</a>
          <a href="https://spatialreal.ai" target="_blank" rel="noreferrer" class="hover:text-gray-900">API</a>
        </div>
      </div>
    </nav>

    <!-- Hero -->
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

        <VideoGenerator />
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
          <a v-for="uc in [
            { icon: '📢', label: 'Marketing Videos', slug: 'marketing-video' },
            { icon: '🎓', label: 'Training & Education', slug: 'training-video' },
            { icon: '🛒', label: 'E-commerce', slug: 'ecommerce-video' },
            { icon: '📱', label: 'Social Media', slug: 'social-media-video' },
            { icon: '🎥', label: 'Product Demos', slug: 'product-demo' },
            { icon: '📚', label: 'Educational', slug: 'education-video' },
          ]" :key="uc.slug" :href="`/use-cases/${uc.slug}`" class="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow block">
            <div class="text-2xl mb-2">{{ uc.icon }}</div>
            <div class="font-medium text-sm">{{ uc.label }}</div>
          </a>
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

    <SiteFooter />
  </div>
</template>
