// Конфигурация сборщика Vite (ЛР6, вариант 19)
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      // Многостраничный режим: каждая HTML-страница — отдельная точка входа сборки
      input: {
        index: resolve(root, "index.html"),
        catalog: resolve(root, "catalog.html"),
        detail: resolve(root, "detail.html"),
        collection: resolve(root, "collection.html"),
        checkout: resolve(root, "checkout.html"),
        credits: resolve(root, "credits.html"),
      },
    },
  },
});
