// Страница «Каталог»: GET-запрос базы инвентаря при открытии страницы
import { getCategories } from "../api.js";
import { applyAction, findItem, loadEquipment } from "../cart.js";
import { calcRentCost, logRentCost } from "../equipment.js";
import { formatMoney } from "../format.js";
import { isInCart } from "../storage.js";
import { createElement, delegateActions, hideLoader, showError, showSkeleton } from "../ui.js";

const renderCatalog = (list, items) => {
  if (!items.length) {
    const empty = createElement("li", "catalog__item page__text", "В этой категории пока нет снаряжения.");
    list.replaceChildren(empty);
    return;
  }
  // replaceChildren очищает контейнер, поэтому карточки не дублируются
  list.replaceChildren(...items.map((item) => item.render(isInCart(item.id))));
};

// Фильтр по категории: список категорий тоже приходит с сервера
const fillCategoryFilter = (select, categories) => {
  const selected = new URLSearchParams(window.location.search).get("category") ?? "";
  select.replaceChildren(new Option("Все категории", ""), ...categories.map((c) => new Option(c.name, c.id)));
  select.value = categories.some((c) => String(c.id) === selected) ? selected : "";
  select.disabled = false;
};

// ------------------------------------------------------------ аналитика варианта 19 (ЛР4)
const createField = (control, id, labelText) => {
  const row = createElement("p", "form__row");
  const label = createElement("label", "form__label", labelText);
  label.setAttribute("for", id);
  control.setAttribute("id", id);
  row.append(label, control);
  return row;
};

const renderRentCost = (target, { rows, total }) => {
  const list = createElement("ul", "section__list");
  rows.forEach((row) => {
    list.append(createElement("li", "section__item", `${row["Наименование"]}: ${formatMoney(row["Итого"])}`));
  });
  const result = createElement("p", "section__text");
  result.append("Итого с залогом: ", createElement("strong", "section__accent", formatMoney(total)));
  target.replaceChildren(list, result);
};

const renderRentCalculator = (target, items) => {
  const section = createElement("section", "page__section section section_note");
  section.setAttribute("aria-labelledby", "rent-cost-title");
  const title = createElement("h2", "section__title", "Расчёт аренды с залогом");
  title.setAttribute("id", "rent-cost-title");

  const select = createElement("select", "form__input");
  [...new Set(items.map((item) => item.category))].forEach((name) => select.append(new Option(name, name)));
  select.value = "Палатки";

  const daysInput = createElement("input", "form__input form__input_short");
  daysInput.setAttribute("type", "number");
  daysInput.setAttribute("min", "1");
  daysInput.setAttribute("max", "30");
  daysInput.value = "7";

  const controls = createElement("div", "form");
  controls.append(createField(select, "rent-category", "Категория:"), createField(daysInput, "rent-days", "Срок аренды, дней:"));

  const output = createElement("div", "section__result");
  output.setAttribute("aria-live", "polite");

  const update = () => {
    const days = Number(daysInput.value);
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      output.replaceChildren(createElement("p", "section__text", "Укажите срок от 1 до 30 дней."));
      return;
    }
    const report = calcRentCost(items, select.value, days);
    logRentCost(report);
    renderRentCost(output, report);
  };
  select.addEventListener("change", update);
  daysInput.addEventListener("input", update);

  section.append(title, controls, output);
  target.append(section);
  update();
};

// ------------------------------------------------------------ запуск страницы
export const initCatalog = () => {
  const list = document.querySelector("#catalog-container");
  const status = document.querySelector("#catalog-status");
  const select = document.querySelector("#category-filter");
  const aside = document.querySelector(".page__aside");
  let items = [];

  const getVisible = () => (select.value ? items.filter((item) => String(item.categoryId) === select.value) : items);
  const rerender = () => renderCatalog(list, getVisible());

  const load = async () => {
    showSkeleton(list); // 1. до запроса — скелетон карточек
    status.replaceChildren();
    try {
      // 2. два GET-запроса выполняются параллельно, ждём оба
      const [equipment, categories] = await Promise.all([loadEquipment(), getCategories()]);
      items = equipment;
      fillCategoryFilter(select, categories);
      hideLoader(list); // 3. ответ получен — скрываем индикатор и рисуем данные
      rerender();
      if (aside && !aside.querySelector("#rent-cost-title")) {
        renderRentCalculator(aside, items);
      }
    } catch (error) {
      // 4. ошибка сети или HTTP-статуса — сообщение пользователю
      list.replaceChildren();
      list.removeAttribute("aria-busy");
      showError(status, error, load);
    }
  };

  delegateActions(list, (id, action) => applyAction(findItem(items, id), action), rerender);

  select.addEventListener("change", () => {
    const url = new URL(window.location.href);
    if (select.value) {
      url.searchParams.set("category", select.value);
    } else {
      url.searchParams.delete("category");
    }
    window.history.replaceState(null, "", url);
    rerender();
  });

  load();
};
