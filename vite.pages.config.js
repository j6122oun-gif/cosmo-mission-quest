// GitHub Pages 用のビルド設定（npm run build:pages）。
// Base44 用の vite.config.js とは別物で、サーバーなしの静的サイトを dist-pages/ に出力する。
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL("./pages", import.meta.url)),
  base: "/cosmo-mission-quest/",
  publicDir: false,
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});
