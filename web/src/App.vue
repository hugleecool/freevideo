<template>
  <router-view />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import { useLocale } from "@/i18n/useLocale";
import {
  GOOGLE_SITE_VERIFICATION,
  BING_SITE_VERIFICATION,
  CF_ANALYTICS_TOKEN,
} from "@/lib/seo-config";

const { meta } = useLocale();
const htmlLang = computed(() => meta.value.htmlLang);

const verificationMeta = [];
if (GOOGLE_SITE_VERIFICATION) {
  verificationMeta.push({ name: "google-site-verification", content: GOOGLE_SITE_VERIFICATION });
}
if (BING_SITE_VERIFICATION) {
  verificationMeta.push({ name: "msvalidate.01", content: BING_SITE_VERIFICATION });
}

const analyticsScript = CF_ANALYTICS_TOKEN
  ? [
      {
        src: "https://static.cloudflareinsights.com/beacon.min.js",
        defer: true,
        "data-cf-beacon": JSON.stringify({ token: CF_ANALYTICS_TOKEN }),
      },
    ]
  : [];

useHead({
  htmlAttrs: { lang: htmlLang },
  titleTemplate: "%s | FreeVideo",
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  meta: verificationMeta,
  script: analyticsScript,
});
</script>
