<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import VideoGenerator from "@/components/VideoGenerator.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import { COMPETITORS } from "@/data/competitors";

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const comp = computed(() => COMPETITORS.find((c) => c.slug === slug.value));

const canonicalUrl = computed(
  () => `https://freevideo-3gk.pages.dev/compare/${slug.value}`,
);

useHead(() => {
  const c = comp.value;
  if (!c) return {};
  return {
    title: c.title,
    meta: [
      { name: "description", content: c.metaDescription },
      { property: "og:title", content: c.title },
      { property: "og:description", content: c.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl.value },
    ],
    link: [{ rel: "canonical", href: canonicalUrl.value }],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: c.faqs.map((f) => ({
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
            { "@type": "ListItem", position: 2, name: "Alternatives", item: "https://freevideo-3gk.pages.dev/" },
            { "@type": "ListItem", position: 3, name: c.title, item: canonicalUrl.value },
          ],
        }),
      },
    ],
  };
});
</script>

<template>
  <div v-if="comp" class="min-h-screen bg-[#f7f9fa] text-gray-900">
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
        <span>Alternatives</span>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ comp.name }}</span>
      </nav>
    </div>

    <!-- Hero -->
    <section class="py-12">
      <div class="max-w-4xl mx-auto px-6">
        <div class="text-center mb-10">
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            {{ comp.h1 }}
          </h1>
          <p class="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
            {{ comp.intro }}
          </p>
        </div>
      </div>
    </section>

    <!-- Comparison table -->
    <section class="bg-white py-16">
      <div class="max-w-4xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-center mb-8">FreeVideo vs {{ comp.name }}</h2>
        <div class="overflow-x-auto">
          <table class="w-full border border-gray-200 rounded-xl overflow-hidden">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left px-5 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">Feature</th>
                <th class="text-left px-5 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">{{ comp.name }}</th>
                <th class="text-left px-5 py-3 text-sm font-semibold text-blue-600 border-b border-gray-200">FreeVideo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in comp.comparison" :key="i" :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                <td class="px-5 py-3 text-sm text-gray-900 border-b border-gray-100">{{ row.feature }}</td>
                <td class="px-5 py-3 text-sm text-gray-600 border-b border-gray-100">{{ row.competitor }}</td>
                <td class="px-5 py-3 text-sm text-blue-600 font-medium border-b border-gray-100">{{ row.freevideo }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Why FreeVideo -->
    <section class="py-16 bg-[#f7f9fa]">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-center mb-8">Why choose FreeVideo</h2>
        <ul class="space-y-3">
          <li v-for="(reason, i) in comp.whyFreeVideo" :key="i" class="bg-white rounded-xl p-4 flex gap-3 shadow-sm">
            <div class="text-blue-600 font-bold">✓</div>
            <div class="text-gray-700 text-sm">{{ reason }}</div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Try it -->
    <section class="py-16 bg-white">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-center mb-8">Try FreeVideo right now</h2>
        <VideoGenerator />
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 bg-[#f7f9fa]">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-center mb-8">Common questions</h2>
        <div class="space-y-4">
          <details v-for="faq in comp.faqs" :key="faq.q" class="bg-white rounded-xl shadow-sm">
            <summary class="px-5 py-4 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">{{ faq.q }}</summary>
            <p class="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{{ faq.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- Other alternatives -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-center mb-8">Compare other alternatives</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a v-for="other in COMPETITORS.filter(c => c.slug !== slug)" :key="other.slug" :href="`/compare/${other.slug}`" class="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div class="font-medium text-gray-900">{{ other.title }}</div>
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
