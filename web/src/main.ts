import { ViteSSG } from "vite-ssg";
import App from "./App.vue";
import "./styles/index.css";
import { USE_CASES } from "./data/use-cases";
import { COMPETITORS } from "./data/competitors";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./i18n/locales";

// Non-default locales for route prefix matching (English uses no prefix)
const NON_DEFAULT_LOCALES = SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE);
const LOCALE_RE = NON_DEFAULT_LOCALES.join("|"); // e.g. "zh|ja|ko|es|fr|de"

const routes = [
  // English (no prefix)
  { path: "/", component: () => import("./pages/Home.vue") },
  { path: "/use-cases/:slug", component: () => import("./pages/UseCase.vue"), props: true },
  { path: "/compare/:slug", component: () => import("./pages/Compare.vue"), props: true },

  // Other locales (prefixed)
  { path: `/:lang(${LOCALE_RE})`, component: () => import("./pages/Home.vue") },
  {
    path: `/:lang(${LOCALE_RE})/use-cases/:slug`,
    component: () => import("./pages/UseCase.vue"),
    props: true,
  },
  {
    path: `/:lang(${LOCALE_RE})/compare/:slug`,
    component: () => import("./pages/Compare.vue"),
    props: true,
  },
];

export const createApp = ViteSSG(
  App,
  { routes },
  ({ router, isClient }) => {
    if (isClient) {
      router.afterEach(() => window.scrollTo({ top: 0, behavior: "auto" }));
    }
  },
);

// Generate all locale combinations for SSG prerendering
export function includedRoutes(): string[] {
  const paths: string[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
    // Home
    paths.push(prefix || "/");
    // Use cases
    for (const uc of USE_CASES) {
      paths.push(`${prefix}/use-cases/${uc.slug}`);
    }
    // Compare
    for (const c of COMPETITORS) {
      paths.push(`${prefix}/compare/${c.slug}`);
    }
  }

  return paths;
}
