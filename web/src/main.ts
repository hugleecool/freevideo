import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createHead } from "@unhead/vue/legacy";
import App from "./App.vue";
import "./styles/index.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("./pages/Home.vue") },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

const head = createHead();
const app = createApp(App);
app.use(router);
app.use(head);
app.mount("#app");
