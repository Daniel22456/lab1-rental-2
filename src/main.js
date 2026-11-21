// Точка входа (ЛР6, вариант 19, прокат снаряжения «Привал», СДР).
// Подключает стили и запускает код нужной страницы по атрибуту <body data-page="…">.
import "./scss/style.scss";
import { initCatalog } from "./pages/catalog.js";
import { initCheckout } from "./pages/checkout.js";
import { initCollection } from "./pages/collection.js";
import { initDetail } from "./pages/detail.js";
import { initHome } from "./pages/home.js";
import { getCart } from "./storage.js";
import { updateCartCount } from "./ui.js";

const pages = {
  home: initHome,
  catalog: initCatalog,
  detail: initDetail,
  collection: initCollection,
  checkout: initCheckout,
};

updateCartCount(getCart().length);
pages[document.body.dataset.page]?.();
