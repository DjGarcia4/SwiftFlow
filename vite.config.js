import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { routePages } from "./build/routePages.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // A real HTML file per route, with its own title and social card. The
    // site's address: SITE_URL if given, else the one Netlify sets on its
    // builds, else the published site.
    routePages({
      siteUrl:
        process.env.SITE_URL ?? process.env.URL ?? "https://swiftflowtyping.netlify.app",
    }),
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png"],
      manifest: {
        name: "SwiftFlow",
        short_name: "SwiftFlow",
        description: "Practica y mejora tu velocidad de escritura",
        lang: "es",
        theme_color: "#f97316",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
