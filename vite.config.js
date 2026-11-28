// Конфигурация сборщика Vite (ЛР8, вариант 19): Vue 3 + однофайловые компоненты
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  // vue() компилирует файлы .vue; vueDevTools() встраивает панель Vue DevTools
  // в страницу в режиме разработки (открывается сочетанием Alt+Shift+D)
  plugins: [vue(), vueDevTools()],
  server: {
    port: 5173,
  },
});
