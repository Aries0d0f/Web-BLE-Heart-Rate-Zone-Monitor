import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      injectRegister: "script-defer",
      devOptions: {
        enabled: true,
      },
      workbox: {
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        globIgnores: ["assets/images/favicon/*"],
        maximumFileSizeToCacheInBytes: 3000000,
      },
      manifest: {
        name: "Web BLE Heart Rate Zone Monitor",
        theme_color: "#000000"
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
});
