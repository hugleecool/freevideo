import { ViteSSG } from "vite-ssg";
import { createHead } from "@unhead/vue/legacy";
import App from "./App.vue";
import "./styles/index.css";
import { USE_CASES } from "./data/use-cases";
import { COMPETITORS } from "./data/competitors";

const routes = [
  { path: "/", component: () => import("./pages/Home.vue") },
  {
    path: "/use-cases/:slug",
    component: () => import("./pages/UseCase.vue"),
    props: true,
  },
  {
    path: "/compare/:slug",
    component: () => import("./pages/Compare.vue"),
    props: true,
  },
];

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router, isClient }) => {
    const head = createHead();
    app.use(head);

    // Router scroll behavior only works on client
    if (isClient) {
      router.afterEach(() => window.scrollTo({ top: 0, behavior: "auto" }));
    }
  },
);

// Static route generator for SSG build
export function includedRoutes(): string[] {
  return [
    "/",
    ...USE_CASES.map((uc) => `/use-cases/${uc.slug}`),
    ...COMPETITORS.map((c) => `/compare/${c.slug}`),
  ];
}
