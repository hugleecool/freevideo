import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { avatarkitVitePlugin } from "@spatialwalk/avatarkit/vite";
import path from "path";

export default defineConfig({
  plugins: [vue(), tailwindcss(), avatarkitVitePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5188,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
