import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Evolu runs SQLite in a web worker and uses OPFS; these headers enable
// cross-origin isolation which OPFS SharedArrayBuffer paths can require.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      // Keep the hand-written public/manifest.webmanifest; only generate the SW.
      manifest: false,
      workbox: {
        // Precache the whole app shell, incl. the SQLite WASM + Evolu workers,
        // so the app boots with zero network. (wasm is ~1 MB → raise the cap.)
        globPatterns: ["**/*.{js,css,html,wasm,woff,woff2,svg,webmanifest,png,ico}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  worker: { format: "es" },
  optimizeDeps: {
    exclude: ["@evolu/common", "@evolu/react", "@evolu/react-web", "@evolu/web"],
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
