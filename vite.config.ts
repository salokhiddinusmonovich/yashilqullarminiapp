import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// Preact вместо React: тот же JSX, но ~4 КБ вместо ~45 КБ —
// приложение открывается в Telegram почти мгновенно даже на слабом 3G.
export default defineConfig({
  plugins: [preact()],
  server: { port: 5174 },
  build: {
    target: "es2020",
    cssCodeSplit: false,
    assetsInlineLimit: 8192,
  },
});
