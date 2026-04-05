<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue/legacy";
import SiteFooter from "@/components/SiteFooter.vue";
import { BLOG_POSTS } from "@/data/blog-posts";
import { SITE_URL } from "@/lib/seo-config";

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const post = computed(() => BLOG_POSTS.find((p) => p.slug === slug.value));

const canonicalUrl = computed(() => `${SITE_URL}/blog/${slug.value}`);

// Simple markdown-to-HTML for bold + links within paragraphs
function renderInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline font-medium">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900">$1</strong>');
}

useHead(() => {
  const p = post.value;
  if (!p) return {};
  return {
    title: p.title,
    meta: [
      { name: "description", content: p.metaDescription },
      { property: "og:title", content: p.title },
      { property: "og:description", content: p.metaDescription },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonicalUrl.value },
      { property: "article:published_time", content: p.publishedAt },
      { property: "article:modified_time", content: p.updatedAt },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    link: [{ rel: "canonical", href: canonicalUrl.value }],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.metaDescription,
          datePublished: p.publishedAt,
          dateModified: p.updatedAt,
          author: { "@type": "Organization", name: "FreeVideo", url: SITE_URL },
          publisher: { "@type": "Organization", name: "SpatialWalk", url: "https://spatialreal.ai" },
          mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl.value },
          wordCount: p.wordCount,
        }),
      },
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: p.faqs.map((f) => ({
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
            { "@type": "ListItem", position: 1, name: "FreeVideo", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
            { "@type": "ListItem", position: 3, name: p.title, item: canonicalUrl.value },
          ],
        }),
      },
    ],
  };
});
</script>

<template>
  <div v-if="post" class="min-h-screen bg-white text-gray-900">
    <!-- Nav -->
    <nav class="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" class="text-xl font-bold tracking-tight text-gray-900">FreeVideo</a>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <a href="/" class="hover:text-gray-900">Home</a>
          <a href="/#use-cases" class="hover:text-gray-900 hidden sm:block">Use cases</a>
        </div>
      </div>
    </nav>

    <!-- Breadcrumb -->
    <div class="max-w-3xl mx-auto px-6 pt-6">
      <nav class="text-sm text-gray-500">
        <a href="/" class="hover:text-gray-900">Home</a>
        <span class="mx-2">/</span>
        <span>Blog</span>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ post.title }}</span>
      </nav>
    </div>

    <!-- Article header -->
    <header class="max-w-3xl mx-auto px-6 pt-8 pb-6">
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
        {{ post.h1 }}
      </h1>
      <div class="flex items-center gap-3 text-sm text-gray-500">
        <time :datetime="post.publishedAt">{{ new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) }}</time>
        <span>·</span>
        <span>{{ post.readingTime }} min read</span>
        <span>·</span>
        <span>{{ post.wordCount.toLocaleString() }} words</span>
      </div>
    </header>

    <!-- Intro -->
    <section class="max-w-3xl mx-auto px-6 pb-8">
      <p class="text-lg text-gray-700 leading-relaxed border-l-4 border-blue-600 pl-4 italic">
        {{ post.intro }}
      </p>
    </section>

    <!-- Table of contents -->
    <aside class="max-w-3xl mx-auto px-6 pb-8">
      <div class="bg-gray-50 rounded-xl p-5">
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Table of contents</h2>
        <ol class="space-y-2">
          <li v-for="item in post.tableOfContents" :key="item.id">
            <a :href="`#${item.id}`" class="text-sm text-blue-600 hover:underline">{{ item.label }}</a>
          </li>
        </ol>
      </div>
    </aside>

    <!-- Sections -->
    <article class="max-w-3xl mx-auto px-6 pb-12 prose-lg">
      <section v-for="section in post.sections" :key="section.id" :id="section.id" class="mb-12 scroll-mt-20">
        <h2 class="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">{{ section.heading }}</h2>

        <p
          v-for="(para, i) in section.paragraphs"
          :key="i"
          class="text-base text-gray-700 leading-relaxed mb-4"
          v-html="renderInline(para)"
        />

        <ul v-if="section.list?.type === 'ul'" class="list-disc pl-6 space-y-2 text-gray-700 mb-4">
          <li v-for="(item, i) in section.list.items" :key="i" v-html="renderInline(item)" />
        </ul>

        <ol v-if="section.list?.type === 'ol'" class="list-decimal pl-6 space-y-3 text-gray-700 mb-4">
          <li v-for="(item, i) in section.list.items" :key="i" v-html="renderInline(item)" />
        </ol>

        <div v-if="section.table" class="overflow-x-auto my-6">
          <table class="w-full border border-gray-200 rounded-xl overflow-hidden text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th v-for="h in section.table.headers" :key="h" class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in section.table.rows" :key="ri" :class="ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                <td v-for="(cell, ci) in row" :key="ci" class="px-4 py-3 text-gray-700 border-b border-gray-100">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="mb-12 scroll-mt-20">
        <h2 class="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">10. Frequently asked questions</h2>
        <div class="space-y-4">
          <details v-for="faq in post.faqs" :key="faq.q" class="bg-gray-50 rounded-xl">
            <summary class="px-5 py-4 cursor-pointer font-medium text-gray-900 hover:text-blue-600 transition-colors">{{ faq.q }}</summary>
            <p class="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{{ faq.a }}</p>
          </details>
        </div>
      </section>

      <!-- Conclusion -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4 text-gray-900">Conclusion</h2>
        <p class="text-base text-gray-700 leading-relaxed">{{ post.conclusion }}</p>
      </section>
    </article>

    <!-- CTA -->
    <section class="bg-[#f7f9fa] py-16">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <h2 class="text-2xl font-bold mb-4">Try FreeVideo now</h2>
        <p class="text-gray-500 mb-6">Type text, pick an avatar, get a video. Forever free, no sign-up.</p>
        <a href="/" class="inline-flex items-center px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors shadow-sm">
          Generate Free Video
        </a>
      </div>
    </section>

    <SiteFooter />
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">Post not found</h1>
      <a href="/" class="text-blue-600 hover:underline">Go home →</a>
    </div>
  </div>
</template>
