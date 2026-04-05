import { writeFileSync } from "node:fs";
import { USE_CASES } from "../src/data/use-cases";
import { COMPETITORS } from "../src/data/competitors";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_META } from "../src/i18n/locales";

const BASE_URL = "https://freevideo-3gk.pages.dev";
const today = new Date().toISOString().split("T")[0];

/**
 * Build the canonical path for a (locale, path) pair.
 * English uses no prefix; other locales get /{lang} prefix.
 */
function localizedPath(locale: string, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}

/**
 * Each URL entry carries hreflang alternates pointing to every locale version
 * of the same logical page, plus x-default pointing to English.
 * This tells Google about language alternates for international SEO.
 */
interface SitemapUrl {
  path: string; // logical path without locale prefix, e.g. "/" or "/use-cases/marketing-video"
  priority: string;
  changefreq: string;
}

const LOGICAL_URLS: SitemapUrl[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  ...USE_CASES.map((uc) => ({
    path: `/use-cases/${uc.slug}`,
    priority: "0.8",
    changefreq: "weekly",
  })),
  ...COMPETITORS.map((c) => ({
    path: `/compare/${c.slug}`,
    priority: "0.8",
    changefreq: "weekly",
  })),
];

// Build one <url> entry per (locale, logical path) combination,
// with alternates linking to every other locale for the same page.
const xmlEntries: string[] = [];
for (const url of LOGICAL_URLS) {
  for (const locale of SUPPORTED_LOCALES) {
    const loc = `${BASE_URL}${localizedPath(locale, url.path)}`;
    const alternates = SUPPORTED_LOCALES
      .map((l) => {
        const altPath = `${BASE_URL}${localizedPath(l, url.path)}`;
        return `    <xhtml:link rel="alternate" hreflang="${LOCALE_META[l].htmlLang}" href="${altPath}"/>`;
      })
      .join("\n");
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${localizedPath(DEFAULT_LOCALE, url.path)}"/>`;
    xmlEntries.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
${alternates}
${xDefault}
  </url>`);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries.join("\n")}
</urlset>
`;

writeFileSync("dist/sitemap.xml", xml, "utf-8");
console.log(
  `✅ sitemap.xml written with ${xmlEntries.length} URLs (${LOGICAL_URLS.length} pages × ${SUPPORTED_LOCALES.length} locales)`,
);
