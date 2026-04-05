<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_META, stripLocale } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";

const route = useRoute();
const { locale } = useLocale();
const open = ref(false);

/**
 * Build the URL for switching to a given locale,
 * preserving the current path (use-cases/compare slug).
 */
const links = computed(() =>
  SUPPORTED_LOCALES.map((l) => {
    const basePath = stripLocale(route.path);
    const prefix = l === DEFAULT_LOCALE ? "" : `/${l}`;
    const href = `${prefix}${basePath === "/" ? "" : basePath}` || "/";
    return { code: l, href, ...LOCALE_META[l] };
  }),
);

function close() {
  open.value = false;
}
</script>

<template>
  <div class="relative">
    <button
      @click="open = !open"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      :aria-expanded="open"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
      <span class="font-medium">{{ LOCALE_META[locale].nativeName }}</span>
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
      @click="close"
    >
      <a
        v-for="l in links"
        :key="l.code"
        :href="l.href"
        :class="[
          'block px-3 py-2 text-sm hover:bg-gray-50',
          l.code === locale ? 'font-semibold text-blue-600' : 'text-gray-700',
        ]"
      >
        {{ l.nativeName }}
        <span class="text-xs text-gray-400 ml-1">{{ l.label }}</span>
      </a>
    </div>

    <!-- Backdrop to close dropdown -->
    <div v-if="open" class="fixed inset-0 z-40" @click="close" />
  </div>
</template>
