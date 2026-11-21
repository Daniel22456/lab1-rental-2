// Модуль предметной области (вариант 19): класс снаряжения и расчёты аренды
import { formatDays, formatMoney } from "./format.js";
import { MAX_DAYS, MIN_DAYS } from "./storage.js";
import { createActionButton, createElement, createLink } from "./ui.js";

const IMAGES = "/images/"; // папка public/images, Vite отдаёт её от корня сайта

export class Equipment {
  // data — объект из ответа сервера (GET /equipment), days — срок из localStorage
  constructor(data, days = MIN_DAYS) {
    this.id = String(data.id);
    this.name = data.name;
    this.categoryId = data.categoryId;
    this.category = data.category;
    this.pricePerDay = data.pricePerDay;
    this.deposit = data.deposit;
    this.weight = data.weight;
    this.available = data.available;
    this.image = data.image;
    this.features = data.features ?? [];
    this.description = data.description ?? [];
    this.specs = data.specs ?? [];
    this.days = days;
  }

  get imageSrc() {
    return IMAGES + this.image.src;
  }

  // Стоимость аренды без залога
  getRent(days = this.days) {
    return this.pricePerDay * days;
  }

  // Стоимость аренды на заданное число дней вместе с залогом
  getRentCost(days) {
    return this.getRent(days) + this.deposit;
  }

  // Новый срок аренды в пределах 1–30 дней
  setDays(days) {
    this.days = Math.min(MAX_DAYS, Math.max(MIN_DAYS, days));
  }

  // Счётчик срока аренды: «−», число дней, «+»
  renderCounter(className) {
    const counter = createElement("div", `${className} counter`);
    counter.setAttribute("role", "group");
    counter.setAttribute("aria-label", `Срок аренды: ${this.name}`);

    const decrease = createActionButton("counter__button", "decrease", "−", "Уменьшить срок на 1 день");
    decrease.disabled = this.days <= MIN_DAYS;
    const increase = createActionButton("counter__button", "increase", "+", "Увеличить срок на 1 день");
    increase.disabled = this.days >= MAX_DAYS;

    counter.append(decrease, createElement("output", "counter__value", formatDays(this.days)), increase);
    return counter;
  }

  // Карточка снаряжения: <li class="catalog__item card" data-id="…">
  render(inCart = false) {
    const card = createElement("li", `catalog__item card${inCart ? " card_in-cart" : ""}`);
    card.dataset.id = this.id;

    const media = createElement("div", "card__media");
    const image = createElement("img", "card__image");
    image.setAttribute("src", this.imageSrc);
    image.setAttribute("alt", this.image.alt);
    image.setAttribute("width", "400");
    image.setAttribute("height", "300");
    image.setAttribute("loading", "lazy");
    media.append(image);
    if (!this.available) {
      media.append(createElement("p", "card__overlay", "В аренде"));
    }

    const body = createElement("div", "card__body");
    const title = createElement("h2", "card__title");
    title.append(createLink("card__link", `/detail.html?id=${this.id}`, this.name));

    const weight = this.weight.toLocaleString("ru-RU");
    body.append(
      createElement("p", "card__category", this.category),
      title,
      createElement("p", "card__text", `${this.features.join(", ")}, вес ${weight} кг`),
      createElement("p", "card__deposit", `Залог: ${formatMoney(this.deposit)}`),
      this.renderFooter(inCart),
    );

    card.append(media, body);
    return card;
  }

  // Цена за сутки, выбор срока, расчётная стоимость и кнопка корзины
  renderFooter(inCart) {
    const footer = createElement("div", "card__footer");

    const price = createElement("p", "card__price");
    price.append(createElement("strong", "card__price-value", formatMoney(this.pricePerDay)), " / сутки");

    const cost = createElement("p", "card__cost");
    cost.append(`Аренда за ${formatDays(this.days)}: `, createElement("strong", "card__cost-value", formatMoney(this.getRent())));

    const cartButton = createActionButton(
      `card__cart button${inCart ? " button_secondary" : ""}`,
      "cart",
      inCart ? "Убрать из корзины" : "В корзину",
    );
    cartButton.append(createElement("span", "card__hidden", `: ${this.name}`));

    footer.append(price, this.renderCounter("card__days"), cost, cartButton);
    return footer;
  }
}

// Итоги по списку позиций: аренда, залог, к оплате
export const calcTotals = (items) => {
  const rent = items.reduce((sum, item) => sum + item.getRent(), 0);
  const deposit = items.reduce((sum, item) => sum + item.deposit, 0);
  return { count: items.length, rent, deposit, total: rent + deposit };
};

// Аналитика варианта 19 (ЛР4): стоимость аренды всех позиций категории с учётом залога
export const calcRentCost = (items, category = "Палатки", days = 7) => {
  const rows = items
    .filter((item) => item.category === category)
    .map((item) => ({
      "Наименование": item.name,
      "Аренда": item.getRent(days),
      "Залог": item.deposit,
      "Итого": item.getRentCost(days),
    }));
  const total = rows.reduce((sum, row) => sum + row["Итого"], 0);
  return { category, days, rows, total };
};

export const logRentCost = ({ category, days, rows, total }) => {
  console.log(`Аренда категории «${category}» на ${formatDays(days)} с учётом залога:`);
  console.table(rows);
  console.log(`Итоговая стоимость: ${formatMoney(total)}`);
};
