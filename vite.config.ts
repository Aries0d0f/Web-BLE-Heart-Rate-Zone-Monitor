import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Unfonts from "unplugin-fonts/vite";
import GitRevision from '@jinixx/vite-plugin-git-revision';

import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    GitRevision({}),
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
        theme_color: "#000000",
      },
    }),
    Unfonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "wght@400;700",
          },
        ],
        display: "swap",
        injectTo: "body",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
