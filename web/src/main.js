import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./styles/index.css";
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: () => import("./pages/Home.vue"),
        },
    ],
});
createApp(App).use(router).mount("#app");
