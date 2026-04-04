<template>
  <router-view />
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue/legacy";

useHead({
  htmlAttrs: { lang: "en" },
  titleTemplate: "%s | FreeVideo",
  link: [
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  ],
});
</script>
