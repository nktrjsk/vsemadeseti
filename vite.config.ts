import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Evolu runs SQLite in a web worker and uses OPFS; these headers enable
// cross-origin isolation which OPFS SharedArrayBuffer paths can require.
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
