import { computed } from "vue";
import { useRoute } from "vue-router";
import { DEFAULT_LOCALE, LOCALE_META, SUPPORTED_LOCALES, type Locale } from "./locales";
import { MESSAGES, t as translate, type Messages } from "./messages";

/**
 * Route-based locale detection.
 * Routes are either `/en/...` or `/` (default English) or `/zh/...` etc.
 */
export function useLocale() {
  const route = useRoute();

  const locale = computed<Locale>(() => {
    const param = (route.params.lang as string | undefined) ?? "";
    return SUPPORTED_LOCALES.includes(param as Locale)
      ? (param as Locale)
      : DEFAULT_LOCALE;
  });

  const messages = computed<Messages>(() => MESSAGES[locale.value]);
  const meta = computed(() => LOCALE_META[locale.value]);

  function t(key: keyof Messages, vars?: Record<string, string | number>): string {
    return translate(locale.value, key, vars);
  }

  return { locale, messages, meta, t };
}
