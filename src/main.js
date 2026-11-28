// Точка входа Vue-приложения (ЛР8, вариант 19, СДР)
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/scss/main.scss";

// Создаём приложение с корневым компонентом App и монтируем его в <div id="app">
createApp(App).mount("#app");
