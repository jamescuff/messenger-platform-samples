import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves project repos under /<repo-name>/. Override via env if needed.
const BASE = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon.svg"],
      manifest: {
        name: "Ymadroddion S4C",
        short_name: "Ymadroddion",
        description: "Welsh phrases for the S4C workplace",
        theme_color: "#0f172a",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: BASE,
        scope: BASE,
        lang: "cy",
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
