import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

// Evolu runs SQLite in a web worker and uses OPFS; these headers enable
// cross-origin isolation which OPFS SharedArrayBuffer paths can require.
export default defineConfig({
  define: {
    // shown in Settings → Diagnostika reports
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Prompt the user before applying an update (see components/ReloadPrompt).
      registerType: "prompt",
      injectRegister: false,
      // Keep the hand-written public/manifest.webmanifest; only generate the SW.
      manifest: false,
      workbox: {
        // Precache the whole app shell, incl. the SQLite WASM + Evolu workers,
        // so the app boots with zero network. (wasm is ~1 MB → raise the cap.)
        globPatterns: ["**/*.{js,css,html,wasm,woff,woff2,svg,webmanifest,png,ico}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "index.html",
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
