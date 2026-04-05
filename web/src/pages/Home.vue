<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import VideoGenerator from "@/components/VideoGenerator.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import LocaleSwitcher from "@/components/LocaleSwitcher.vue";
import { useLocale } from "@/i18n/useLocale";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_META, localizedPath } from "@/i18n/locales";

const { locale, t } = useLocale();

const SITE_URL = "https://freevideo-3gk.pages.dev";

const canonicalUrl = computed(() => `${SITE_URL}${localizedPath(locale.value, "/")}`);

// hreflang alternates: one per supported locale + x-default → English
const hreflangLinks = computed(() => {
  const links = SUPPORTED_LOCALES.map((l) => ({
    rel: "alternate",
    hreflang: LOCALE_META[l].htmlLang,
    href: `${SITE_URL}${localizedPath(l, "/")}`,
  }));
  links.push({
    rel: "alternate",
    hreflang: "x-default",
    href: `${SITE_URL}${localizedPath(DEFAULT_LOCALE, "/")}`,
  });
  return links;
});

const pageTitle = computed(() => t("home_title"));
const pageDescription = computed(() => t("home_description"));
const ogTitle = computed(() => t("home_og_title"));
const ogDescription = computed(() => t("home_og_description"));
const ogLocale = computed(() => LOCALE_META[locale.value].htmlLang.replace("-", "_"));

useHead({
  title: pageTitle,
  meta: [
    { name: "description", content: pageDescription },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDescription },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:locale", content: ogLocale },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  link: computed(() => [
    { rel: "canonical", href: canonicalUrl.value },
    ...hreflangLinks.value,
  ]),
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
        url: SITE_URL,
      }),
    },
  ],
});

function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

const homeHref = computed(() => localizedPath(locale.value, "/"));
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fa] text-gray-900">
    <!-- Nav -->
    <nav class="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a :href="homeHref" class="text-xl font-bold tracking-tight text-gray-900">FreeVideo</a>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <a href="#how-it-works" class="hover:text-gray-900 hidden sm:block px-3 py-1.5">{{ t("how_title") }}</a>
          <LocaleSwitcher />
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="min-h-[calc(100vh-3.5rem)] flex items-center">
      <div class="max-w-6xl mx-auto px-6 py-12 w-full">
        <div class="text-center mb-10">
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            {{ t("hero_h1") }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
            {{ t("hero_subtitle") }}
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
        <h2 class="text-3xl font-bold text-center mb-12">{{ t("how_title") }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(step, i) in [t('how_step_1'), t('how_step_2'), t('how_step_4')]" :key="i" class="text-center">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">{{ i + 1 }}</div>
            <p class="text-gray-500 text-sm">{{ step }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why free -->
    <section class="py-20 bg-[#f7f9fa]">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-3xl font-bold mb-8">{{ t("why_title") }}</h2>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
          <li v-for="item in [t('why_item_1'), t('why_item_2'), t('why_item_3'), t('why_item_4'), t('why_item_5')]" :key="item" class="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-gray-700">{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-white">
      <div class="max-w-2xl mx-auto px-6 text-center">
        <button @click="scrollToTop" class="inline-flex items-center px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors shadow-sm">
          {{ t("gen_button") }}
        </button>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
