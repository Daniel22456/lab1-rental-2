"use strict";

// ЛР4, вариант 19: каталог экипировки строится из массива данных через DOM API.

const IMAGES = "/static/images/";

// ------------------------------------------------------------ исходные данные
// 15 позиций, id совпадают с id в базе данных (seed.sql)
const equipmentData = [
  { id: 1, name: "Палатка «Ветер-3»", category: "Палатки", pricePerDay: 450, deposit: 8000, weight: 6.5, available: true,
    image: { src: "photo-tent-veter.jpg", alt: "Светлая кемпинговая палатка с окнами и трубой печи на берегу горного озера" },
    features: ["3 человека", "выход для трубы печи"] },
  { id: 2, name: "Палатка «Купол-2»", category: "Палатки", pricePerDay: 350, deposit: 6000, weight: 2.6, available: false,
    image: { src: "tent-kupol.svg", alt: "Лёгкая палатка-купол" },
    features: ["2 человека", "лето"] },
  { id: 3, name: "Рюкзак «Тропа 70»", category: "Рюкзаки", pricePerDay: 200, deposit: 5000, weight: 2.1, available: true,
    image: { src: "backpack-tropa.svg", alt: "Большой походный рюкзак" },
    features: ["70 л", "накидка от дождя"] },
  { id: 4, name: "Рюкзак «Штурм 50»", category: "Рюкзаки", pricePerDay: 150, deposit: 3500, weight: 1.8, available: true,
    image: { src: "photo-backpack-shturm.jpg", alt: "Чёрный тактический рюкзак на 50 литров" },
    features: ["50 л", "стропы MOLLE"] },
  { id: 5, name: "Спальный мешок «Зима −20»", category: "Спальные принадлежности", pricePerDay: 180, deposit: 4000, weight: 2.4, available: true,
    image: { src: "photo-sleeping-bag.jpg", alt: "Тёмно-зелёный спальный мешок-одеяло у костра в лесу" },
    features: ["до −20 °C", "флис"] },
  { id: 6, name: "Коврик самонадувающийся", category: "Спальные принадлежности", pricePerDay: 80, deposit: 1500, weight: 0.9, available: true,
    image: { src: "mat.svg", alt: "Самонадувающийся туристический коврик" },
    features: ["толщина 5 см", "183 × 51 см"] },
  { id: 7, name: "Газовая горелка с котелком", category: "Туристическое оборудование", pricePerDay: 120, deposit: 2500, weight: 0.6, available: true,
    image: { src: "photo-burner.jpg", alt: "Газовая горелка с котелком в термочехле на газовом баллоне" },
    features: ["котелок 1 л", "пьезоподжиг"] },
  { id: 8, name: "Трекинговые палки (пара)", category: "Туристическое оборудование", pricePerDay: 100, deposit: 2000, weight: 0.5, available: true,
    image: { src: "poles.svg", alt: "Телескопические трекинговые палки" },
    features: ["телескопические", "алюминий"] },
  { id: 9, name: "Вода, бутыль 3 л", category: "Туристическое оборудование", pricePerDay: 30, deposit: 500, weight: 1.2, available: false,
    image: { src: "photo-water.jpg", alt: "Стеклянная бутыль объёмом 3 литра с чёрной этикеткой" },
    features: ["3 л", "стекло"] },
  { id: 10, name: "Палатка «Шторм-4»", category: "Палатки", pricePerDay: 600, deposit: 10000, weight: 5.8, available: true,
    image: { src: "tent-shtorm.svg", alt: "Зелёная четырёхместная палатка-купол на траве" },
    features: ["4 человека", "2 входа"] },
  { id: 11, name: "Палатка «Бивак-1»", category: "Палатки", pricePerDay: 250, deposit: 4000, weight: 1.4, available: true,
    image: { src: "tent-bivak.svg", alt: "Жёлтая одноместная палатка на траве" },
    features: ["1 человек", "лето"] },
  { id: 12, name: "Рюкзак «Атака 30»", category: "Рюкзаки", pricePerDay: 120, deposit: 2500, weight: 0.9, available: true,
    image: { src: "backpack-ataka.svg", alt: "Красный рюкзак на 30 литров" },
    features: ["30 л", "жёсткая спинка"] },
  { id: 13, name: "Спальный мешок «Лето +10»", category: "Спальные принадлежности", pricePerDay: 100, deposit: 2000, weight: 0.8, available: true,
    image: { src: "sleeping-bag-leto.svg", alt: "Оранжевый спальный мешок-кокон на траве" },
    features: ["комфорт +10 °C", "кокон"] },
  { id: 14, name: "Налобный фонарь", category: "Туристическое оборудование", pricePerDay: 60, deposit: 1000, weight: 0.1, available: true,
    image: { src: "headlamp.svg", alt: "Налобный фонарь с оранжевым корпусом и лучом света" },
    features: ["350 лм", "до 40 ч"] },
  { id: 15, name: "Котелок туристический 2 л", category: "Туристическое оборудование", pricePerDay: 50, deposit: 800, weight: 0.5, available: true,
    image: { src: "kettle.svg", alt: "Металлический котелок с дужкой над огнём" },
    features: ["2 л", "нержавеющая сталь"] },
];

// ------------------------------------------------------------ класс данных
const formatMoney = (value) => `${value.toLocaleString("ru-RU")} ₽`;

class Equipment {
  constructor({ id, name, category, pricePerDay, deposit, weight, available, image, features }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.pricePerDay = pricePerDay;
    this.deposit = deposit;
    this.weight = weight;
    this.available = available;
    this.image = image;
    this.features = features;
  }

  // Стоимость аренды на заданное число дней вместе с залогом
  getRentCost(days) {
    return this.pricePerDay * days + this.deposit;
  }

  // Создаёт элемент с БЭМ-классом и, если нужно, текстом
  static createElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  }

  // Карточка снаряжения: <li class="catalog__item card" data-id="…">
  render() {
    const el = Equipment.createElement;
    const card = el("li", "catalog__item card");
    card.dataset.id = this.id;

    const media = el("div", "card__media");
    const image = el("img", "card__image");
    image.setAttribute("src", IMAGES + this.image.src);
    image.setAttribute("alt", this.image.alt);
    image.setAttribute("width", "400");
    image.setAttribute("height", "300");
    media.append(image);
    if (!this.available) {
      media.append(el("p", "card__overlay", "В аренде"));
    }

    const body = el("div", "card__body");
    const title = el("h2", "card__title");
    const link = el("a", "card__link", this.name);
    link.setAttribute("href", `/detail.html?id=${this.id}`);
    title.append(link);

    const weight = this.weight.toLocaleString("ru-RU");
    body.append(
      el("p", "card__category", this.category),
      title,
      el("p", "card__text", `${this.features.join(", ")}, вес ${weight} кг`),
      el("p", "card__deposit", `Залог: ${formatMoney(this.deposit)}`),
      this.renderFooter(),
    );

    card.append(media, body);
    return card;
  }

  // Цена и флажок «Выбрать» (флажок отправляется формой добавления в список аренды)
  renderFooter() {
    const el = Equipment.createElement;
    const footer = el("div", "card__footer");

    const price = el("p", "card__price");
    price.append(el("strong", "card__price-value", formatMoney(this.pricePerDay)), " / сутки");

    const label = el("label", "card__pick");
    const checkbox = el("input", "card__checkbox");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", `pick-${this.id}`);
    checkbox.setAttribute("name", "equipment_id");
    checkbox.setAttribute("value", this.id);
    checkbox.dataset.id = this.id;
    label.setAttribute("for", checkbox.id);
    label.append(checkbox, " Выбрать", el("span", "card__hidden", `: ${this.name}`));

    footer.append(price, label);
    return footer;
  }
}

// ------------------------------------------------------------ отрисовка каталога
const renderCatalog = (container, items) => {
  items.forEach((item) => container.append(item.render()));
};

// Категория, выбранная в фильтре над каталогом (пустая строка — все категории)
const getSelectedCategory = () => {
  const select = document.querySelector("#category-filter");
  return select && select.value ? select.selectedOptions[0].textContent : "";
};

// ------------------------------------------------------------ аналитика (вариант 19)
// Итоговая стоимость аренды на 7 дней всех палаток с учётом залога
const calcTentsRentCost = (items, days = 7) => {
  const rows = items
    .filter((item) => item.category === "Палатки")
    .map((item) => ({
      "Наименование": item.name,
      "Аренда": item.pricePerDay * days,
      "Залог": item.deposit,
      "Итого": item.getRentCost(days),
    }));
  const total = rows.reduce((sum, row) => sum + row["Итого"], 0);
  return { days, rows, total };
};

const logTentsRentCost = ({ days, rows, total }) => {
  console.log(`Аренда всех палаток на ${days} дней с учётом залога:`);
  console.table(rows);
  console.log(`Итоговая стоимость: ${formatMoney(total)}`);
};

// Тот же результат в боковой панели страницы
const renderTentsRentCost = (target, { days, rows, total }) => {
  const el = Equipment.createElement;
  const section = el("section", "page__section section section_note");
  section.setAttribute("aria-labelledby", "tents-cost-title");
  const title = el("h2", "section__title", `Все палатки на ${days} дней`);
  title.setAttribute("id", "tents-cost-title");

  const list = el("ul", "section__list");
  rows.forEach((row) => {
    list.append(el("li", "section__item", `${row["Наименование"]}: ${formatMoney(row["Итого"])}`));
  });

  const result = el("p", "section__text");
  result.append("Итого с залогом: ", el("strong", "section__accent", formatMoney(total)));

  section.append(title, list, result);
  target.append(section);
};

// ------------------------------------------------------------ запуск
const initCatalog = () => {
  const container = document.querySelector("#catalog-container");
  if (!container) {
    return; // скрипт подключён ко всем страницам, каталог есть только на одной
  }

  const equipment = equipmentData.map((data) => new Equipment(data));
  const category = getSelectedCategory();
  const visible = category ? equipment.filter((item) => item.category === category) : equipment;
  renderCatalog(container, visible);

  const report = calcTentsRentCost(equipment);
  logTentsRentCost(report);
  const aside = document.querySelector(".page__aside");
  if (aside) {
    renderTentsRentCost(aside, report);
  }
};

initCatalog();
