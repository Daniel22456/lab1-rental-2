// Подробная страница снаряжения: GET /equipment/:id и GET /equipment?categoryId=…
import { getEquipmentByCategory, getEquipmentItem } from "../api.js";
import { Equipment } from "../equipment.js";
import { formatDays, formatMoney } from "../format.js";
import { addToCart, getCart, getDays, setDays } from "../storage.js";
import { createElement, createLink, showError, showLoader, updateCartCount } from "../ui.js";

const renderBreadcrumbs = (item) => {
  const nav = createElement("nav", "page__section breadcrumbs");
  nav.setAttribute("aria-label", "Навигационная цепочка");
  const list = createElement("ol", "breadcrumbs__list");
  const crumb = (content) => {
    const li = createElement("li", "breadcrumbs__item");
    li.append(content);
    return li;
  };
  list.append(
    crumb(createLink("link", "/index.html", "Главная")),
    crumb(createLink("link", "/catalog.html", "Каталог")),
    crumb(createLink("link", `/catalog.html?category=${item.categoryId}`, item.category)),
    crumb(item.name),
  );
  nav.append(list);
  return nav;
};

const createPart = (titleText, ...content) => {
  const part = createElement("section", "section__part");
  part.append(createElement("h2", "section__title", titleText), ...content);
  return part;
};

// Форма «Добавить в корзину»: срок берётся из поля ввода
const renderCartForm = (item) => {
  const form = createElement("form", "form form_inline");
  form.id = "detail-cart-form";
  const row = createElement("p", "form__row");
  const label = createElement("label", "form__label", "Срок аренды, дней:");
  label.setAttribute("for", "detail-days");
  const input = createElement("input", "form__input form__input_short");
  Object.assign(input, { type: "number", id: "detail-days", name: "days", min: 1, max: 30, required: true, value: item.days });
  const button = createElement("button", "form__button button", "Добавить в корзину");
  button.type = "submit";
  row.append(label, input, button);
  const status = createElement("p", "form__status");
  status.setAttribute("role", "status");
  form.append(row, status);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    item.setDays(Number(input.value));
    input.value = item.days;
    setDays(item.id, item.days);
    addToCart(item.id);
    updateCartCount(getCart().length);
    status.textContent = `Добавлено в корзину на ${formatDays(item.days)}: аренда ${formatMoney(item.getRent())}, залог ${formatMoney(item.deposit)}.`;
  });
  return form;
};

const renderDetail = (container, item) => {
  const article = createElement("article", "page__section section");
  const title = createElement("h1", "page__title", `${item.name} — `);
  const wm = createElement("abbr", "", "СДР");
  wm.title = "Саяхов Даниэль, ИВТ-ПО-302Б";
  title.append(wm);

  const figure = createElement("figure", "section__figure");
  const image = createElement("img", "section__image");
  Object.assign(image, { src: item.imageSrc, alt: item.image.alt, width: 480 });
  figure.append(image, createElement("figcaption", "section__caption", `${item.name}: внешний вид`));

  const parts = [createPart("Описание", ...item.description.map((text) => createElement("p", "section__text", text)))];

  if (item.specs.length) {
    const specs = createElement("dl", "section__specs");
    item.specs.forEach(({ name, value }) => {
      specs.append(createElement("dt", "section__term", name), createElement("dd", "section__value", value));
    });
    parts.push(createPart("Характеристики", specs));
  }

  const prices = createElement("ul", "section__list");
  prices.append(
    createElement("li", "section__item", `Цена аренды: ${formatMoney(item.pricePerDay)} в сутки`),
    createElement("li", "section__item", `Залоговая стоимость: ${formatMoney(item.deposit)} (возвращается после сдачи снаряжения)`),
    createElement("li", "section__item", `Пример: аренда на 3 дня — ${formatMoney(item.getRent(3))} и залог ${formatMoney(item.deposit)}`),
  );
  if (!item.available) {
    prices.append(createElement("li", "section__item", "Сейчас позиция в аренде: заявку можно оформить на следующие даты."));
  }
  parts.push(createPart("Стоимость аренды", prices), createPart("Добавить в корзину", renderCartForm(item)));

  article.append(title, figure, ...parts);
  container.replaceChildren(renderBreadcrumbs(item), article);
};

const renderRelated = (aside, item, related) => {
  const others = related.filter((other) => String(other.id) !== item.id);
  if (!others.length) {
    aside.replaceChildren();
    return;
  }
  const section = createElement("section", "page__section section section_note");
  const list = createElement("ul", "section__list");
  others.forEach((other) => {
    const li = createElement("li", "section__item");
    li.append(createLink("link", `/detail.html?id=${other.id}`, other.name), ` — ${formatMoney(other.pricePerDay)} в сутки`);
    list.append(li);
  });
  section.append(createElement("h2", "section__title", `Другое снаряжение в категории «${item.category}»`), list);
  aside.replaceChildren(section);
};

export const initDetail = () => {
  const container = document.querySelector("#detail-container");
  const aside = document.querySelector("#related-container");
  const id = new URLSearchParams(window.location.search).get("id");
  updateCartCount(getCart().length);

  const load = async () => {
    if (!id) {
      showError(container, new Error("Не указан номер позиции. Выберите снаряжение в каталоге."));
      return;
    }
    showLoader(container, "Загрузка описания снаряжения…");
    try {
      const item = new Equipment(await getEquipmentItem(id), getDays(id));
      document.title = `${item.name} — прокат «Привал» | СДР`;
      renderDetail(container, item);
      container.removeAttribute("aria-busy");

      // Второй запрос зависит от первого: нужна категория позиции
      showLoader(aside, "Загрузка похожего снаряжения…");
      renderRelated(aside, item, await getEquipmentByCategory(item.categoryId));
      aside.removeAttribute("aria-busy");
    } catch (error) {
      const target = container.querySelector("article") ? aside : container;
      showError(target, error, load);
    }
  };
  load();
};
