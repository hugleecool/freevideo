<template>
  <router-view />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import { useLocale } from "@/i18n/useLocale";

const { meta } = useLocale();
const htmlLang = computed(() => meta.value.htmlLang);

useHead({
  htmlAttrs: { lang: htmlLang },
  titleTemplate: "%s | FreeVideo",
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
});
</script>
