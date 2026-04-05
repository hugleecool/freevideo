export const SUPPORTED_LOCALES = ["en", "zh", "ja", "ko", "es", "fr", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<Locale, { label: string; nativeName: string; htmlLang: string }> = {
  en: { label: "English", nativeName: "English", htmlLang: "en" },
  zh: { label: "Chinese", nativeName: "中文", htmlLang: "zh-CN" },
  ja: { label: "Japanese", nativeName: "日本語", htmlLang: "ja" },
  ko: { label: "Korean", nativeName: "한국어", htmlLang: "ko" },
  es: { label: "Spanish", nativeName: "Español", htmlLang: "es" },
  fr: { label: "French", nativeName: "Français", htmlLang: "fr" },
  de: { label: "German", nativeName: "Deutsch", htmlLang: "de" },
};

/**
 * Map locale → default voice id (from voices.ts).
 * For locales without a matching native voice, fall back to English
 * (Fish Audio S2-Pro auto-detects language from text anyway).
 */
export const LOCALE_DEFAULT_VOICE: Record<Locale, string> = {
  en: "b545c585f631496c914815291da4e893", // Friendly Women (en)
  zh: "4f201abba2574feeae11e5ebf737859e", // 琨琨 (女声)
  ja: "5161d41404314212af1254556477c17d", // 元気な女性
  ko: "5c71ab35290241ed842d036e4bb0e5da", // 손정은
  es: "b545c585f631496c914815291da4e893", // fallback to English voice
  fr: "b545c585f631496c914815291da4e893",
  de: "b545c585f631496c914815291da4e893",
};

/** Build locale-prefixed URL path. English uses no prefix. */
export function localizedPath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === "/" ? "" : clean}`;
}

/** Extract locale from a URL path. Returns DEFAULT_LOCALE if no prefix. */
export function localeFromPath(pathname: string): Locale {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (!match) return DEFAULT_LOCALE;
  const code = match[1] as Locale;
  return SUPPORTED_LOCALES.includes(code) ? code : DEFAULT_LOCALE;
}

/** Strip locale prefix from path. "/zh/use-cases/x" → "/use-cases/x" */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (!match) return pathname;
  const code = match[1] as Locale;
  if (!SUPPORTED_LOCALES.includes(code) || code === DEFAULT_LOCALE) return pathname;
  return pathname.slice(3) || "/";
}
