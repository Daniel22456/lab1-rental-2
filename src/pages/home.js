// Главная страница: число позиций и по одной позиции из каждой категории (GET-запросы)
import { getCategories, getEquipment } from "../api.js";
import { formatMoney, plural } from "../format.js";
import { createElement, createLink, showError, showLoader } from "../ui.js";

const renderStats = (target, equipment, categories) => {
  const n = equipment.length;
  const c = categories.length;
  target.textContent = `Сейчас в каталоге ${n} ${plural(n, "единица", "единицы", "единиц")} снаряжения ` +
    `в ${c} ${plural(c, "категории", "категориях", "категориях")}. ` +
    "Всё снаряжение после каждого возврата проверяется, чистится и при необходимости ремонтируется.";
};

const renderFeatured = (container, equipment, categories) => {
  const parts = categories
    .map((category) => equipment.find((item) => item.categoryId === Number(category.id)))
    .filter(Boolean)
    .map((item) => {
      const part = createElement("article", "section__part");
      const title = createElement("h3", "section__subtitle");
      title.append(createLink("link", `/detail.html?id=${item.id}`, item.name));
      part.append(title, createElement("p", "section__text",
        `Категория: ${item.category}. Цена аренды — ${formatMoney(item.pricePerDay)} в сутки, залог — ${formatMoney(item.deposit)}.`));
      return part;
    });
  container.replaceChildren(...parts);
};

export const initHome = () => {
  const stats = document.querySelector("#home-stats");
  const featured = document.querySelector("#featured-container");

  const load = async () => {
    showLoader(featured, "Загрузка каталога…");
    try {
      const [equipment, categories] = await Promise.all([getEquipment(), getCategories()]);
      featured.removeAttribute("aria-busy");
      renderStats(stats, equipment, categories);
      renderFeatured(featured, equipment, categories);
    } catch (error) {
      showError(featured, error, load);
    }
  };
  load();
};
