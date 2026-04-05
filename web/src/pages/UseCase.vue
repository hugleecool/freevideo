<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue/legacy";
import VideoGenerator from "@/components/VideoGenerator.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import { USE_CASES } from "@/data/use-cases";

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const useCase = computed(() => USE_CASES.find((uc) => uc.slug === slug.value));

const canonicalUrl = computed(
  () => `https://freevideo-3gk.pages.dev/use-cases/${slug.value}`,
);

useHead(() => {
  const uc = useCase.value;
  if (!uc) return {};
  return {
    title: uc.title,
    meta: [
      { name: "description", content: uc.metaDescription },
      { property: "og:title", content: uc.title },
      { property: "og:description", content: uc.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl.value },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    link: [{ rel: "canonical", href: canonicalUrl.value }],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: `FreeVideo - ${uc.title}`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          description: uc.metaDescription,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url: canonicalUrl.value,
        }),
      },
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: uc.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "FreeVideo", item: "https://freevideo-3gk.pages.dev/" },
            { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://freevideo-3gk.pages.dev/#use-cases" },
            { "@type": "ListItem", position: 3, name: uc.title, item: canonicalUrl.value },
          ],
        }),
      },
    ],
  };
});
</script>

<template>
  <div v-if="useCase" class="min-h-screen bg-[#f7f9fa] text-gray-900">
    <!-- Nav -->
    <nav class="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" class="text-xl font-bold tracking-tight text-gray-900">FreeVideo</a>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <a href="/" class="hover:text-gray-900">Home</a>
          <a href="https://spatialreal.ai" target="_blank" rel="noreferrer" class="hover:text-gray-900">API</a>
        </div>
      </div>
    </nav>

    <!-- Breadcrumb -->
    <div class="max-w-6xl mx-auto px-6 pt-6">
      <nav class="text-sm text-gray-500">
        <a href="/" class="hover:text-gray-900">Home</a>
        <span class="mx-2">/</span>
        <span>Use Cases</span>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ useCase.title }}</span>
      </nav>
    </div>

    <!-- Hero + Tool -->
    <section class="py-12">
      <div class="max-w-6xl mx-auto px-6 w-full">
        <div class="text-center mb-10">
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4 max-w-3xl mx-auto">
            {{ useCase.h1 }}
          </h1>
          <p class="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
            {{ useCase.intro }}
          </p>
          <div class="mt-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-semibold">
              Forever Free · No Sign-up
            </span>
          </div>
        </div>

        <VideoGenerator />
      </div>
    </section>

    <!-- Example scripts -->
    <section class="bg-white py-16">
      <div class="max-w-4xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-center mb-8">Example scripts you can try</h2>
        <div class="space-y-4">
          <div v-for="(example, i) in useCase.examples" :key="i" class="bg-gray-50 rounded-xl p-5">
            <div class="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">Example {{ i + 1 }}</div>
            <p class="text-gray-700 leading-relaxed italic">"{{ example }}"</p>
          </div>
        </div>
        <p class="text-center text-sm text-gray-400 mt-6">
          Copy any example above, paste it in the generator, and download your video.
        </p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 bg-[#f7f9fa]">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
        <div class="space-y-4">
          <details v-for="faq in useCase.faqs" :key="faq.q" class="bg-white rounded-xl shadow-sm">
            <summary class="px-5 py-4 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">{{ faq.q }}</summary>
            <p class="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{{ faq.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- Related use cases -->
    <section class="py-16 bg-white">
      <div class="max-w-5xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-center mb-8">Explore other use cases</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <a v-for="uc in USE_CASES.filter(u => u.slug !== slug)" :key="uc.slug" :href="`/use-cases/${uc.slug}`" class="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div class="font-medium text-sm text-gray-900">{{ uc.title }}</div>
          </a>
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">Page not found</h1>
      <a href="/" class="text-blue-600 hover:underline">Go home →</a>
    </div>
  </div>
</template>
