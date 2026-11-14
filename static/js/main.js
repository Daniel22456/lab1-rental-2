"use strict";

// Вариант 19, прокат снаряжения «Привал».
// ЛР4: каталог строится из массива данных через DOM API.
// ЛР5: события, делегирование, корзина и заявки в localStorage.

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

// ------------------------------------------------------------ localStorage (ЛР5)
const STORAGE_KEYS = {
  equipment: "privalEquipment", // рабочий массив снаряжения со сроком аренды каждой позиции
  cart: "privalCart",           // id позиций в корзине
  orders: "privalOrders",       // отправленные заявки на аренду
};
const MIN_DAYS = 1;
const MAX_DAYS = 30;

// Чтение с разбором JSON. Если данных нет или они повреждены — значение по умолчанию
const readStorage = (key, fallback) => {
  try {
    const json = localStorage.getItem(key);
    return json === null ? fallback : JSON.parse(json);
  } catch (error) {
    console.warn(`Не удалось прочитать «${key}» из localStorage:`, error);
    return fallback;
  }
};

// Запись с сериализацией в JSON
const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Не удалось сохранить «${key}» в localStorage:`, error);
  }
};

// ------------------------------------------------------------ форматирование
const formatMoney = (value) => `${value.toLocaleString("ru-RU")} ₽`;

// 1 день, 2 дня, 5 дней
const formatDays = (count) => {
  const last = count % 10;
  const lastTwo = count % 100;
  let word = "дней";
  if (last === 1 && lastTwo !== 11) {
    word = "день";
  } else if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    word = "дня";
  }
  return `${count} ${word}`;
};

// ------------------------------------------------------------ класс данных
class Equipment {
  constructor({ id, name, category, pricePerDay, deposit, weight, available, image, features, days = MIN_DAYS }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.pricePerDay = pricePerDay;
    this.deposit = deposit;
    this.weight = weight;
    this.available = available;
    this.image = image;
    this.features = features;
    this.days = days; // ЛР5: срок аренды, выбранный кнопками «−» и «+»
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

  // Создаёт элемент с БЭМ-классом и, если нужно, текстом
  static createElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  }

  // Кнопка с действием для делегирования: <button data-action="…">
  static createActionButton(className, action, text, label) {
    const button = Equipment.createElement("button", className, text);
    button.setAttribute("type", "button");
    button.dataset.action = action;
    if (label) {
      button.setAttribute("aria-label", label);
    }
    return button;
  }

  // Счётчик срока аренды: «−», число дней, «+»
  renderCounter(className) {
    const el = Equipment.createElement;
    const counter = el("div", `${className} counter`);
    counter.setAttribute("role", "group");
    counter.setAttribute("aria-label", `Срок аренды: ${this.name}`);

    const decrease = Equipment.createActionButton("counter__button", "decrease", "−", "Уменьшить срок на 1 день");
    decrease.disabled = this.days <= MIN_DAYS;
    const increase = Equipment.createActionButton("counter__button", "increase", "+", "Увеличить срок на 1 день");
    increase.disabled = this.days >= MAX_DAYS;

    counter.append(decrease, el("output", "counter__value", formatDays(this.days)), increase);
    return counter;
  }

  // Карточка снаряжения: <li class="catalog__item card" data-id="…">
  render(inCart = false) {
    const el = Equipment.createElement;
    const card = el("li", `catalog__item card${inCart ? " card_in-cart" : ""}`);
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
      this.renderFooter(inCart),
    );

    card.append(media, body);
    return card;
  }

  // Цена за сутки, выбор срока, расчётная стоимость и кнопка корзины
  renderFooter(inCart) {
    const el = Equipment.createElement;
    const footer = el("div", "card__footer");

    const price = el("p", "card__price");
    price.append(el("strong", "card__price-value", formatMoney(this.pricePerDay)), " / сутки");

    const cost = el("p", "card__cost");
    cost.append(`Аренда за ${formatDays(this.days)}: `, el("strong", "card__cost-value", formatMoney(this.getRent())));

    const cartButton = Equipment.createActionButton(
      `card__cart button${inCart ? " button_secondary" : ""}`,
      "cart",
      inCart ? "Убрать из корзины" : "В корзину",
    );
    cartButton.append(el("span", "card__hidden", `: ${this.name}`));

    footer.append(price, this.renderCounter("card__days"), cost, cartButton);
    return footer;
  }
}

// ------------------------------------------------------------ состояние приложения
// ЛР5, п. 8: при загрузке скрипта данные читаются из localStorage.
// Если сохранённого массива нет, используется массив по умолчанию из ЛР4.
const loadEquipment = () => {
  const saved = readStorage(STORAGE_KEYS.equipment, null);
  const source = Array.isArray(saved) && saved.length ? saved : equipmentData;
  return source.map((data) => new Equipment(data)); // после JSON.parse методы класса нужно вернуть
};

const state = {
  equipment: loadEquipment(),
  cart: readStorage(STORAGE_KEYS.cart, []),
  orders: readStorage(STORAGE_KEYS.orders, []),
};
// В корзине оставляем только существующие позиции без повторов
state.cart = [...new Set(state.cart)].filter((id) => state.equipment.some((item) => item.id === id));

const saveEquipment = () => writeStorage(STORAGE_KEYS.equipment, state.equipment);
const saveCart = () => writeStorage(STORAGE_KEYS.cart, state.cart);
const saveOrders = () => writeStorage(STORAGE_KEYS.orders, state.orders);

const findItem = (id) => state.equipment.find((item) => item.id === id);
const isInCart = (id) => state.cart.includes(id);
const getCartItems = () => state.cart.map(findItem);

const addToCart = (id) => {
  if (!isInCart(id)) {
    state.cart.push(id);
    saveCart();
  }
};

const toggleCart = (id) => {
  if (isInCart(id)) {
    state.cart = state.cart.filter((cartId) => cartId !== id);
    saveCart();
  } else {
    addToCart(id);
  }
};

// Итоги по списку позиций: аренда, залог, к оплате
const calcTotals = (items) => {
  const rent = items.reduce((sum, item) => sum + item.getRent(), 0);
  const deposit = items.reduce((sum, item) => sum + item.deposit, 0);
  return { count: items.length, rent, deposit, total: rent + deposit };
};

// Счётчик корзины в пункте меню «Список аренды (N)» на всех страницах
const updateCartCount = () => {
  document.querySelectorAll("[data-cart-count]").forEach((counter) => {
    counter.textContent = state.cart.length;
  });
};

// Общая обработка кнопок «−», «+», «В корзину», «Убрать»
const applyAction = (item, action) => {
  if (action === "increase" || action === "decrease") {
    item.setDays(item.days + (action === "increase" ? 1 : -1));
    saveEquipment();
  } else if (action === "cart") {
    toggleCart(item.id);
  } else if (action === "remove") {
    state.cart = state.cart.filter((id) => id !== item.id);
    saveCart();
  }
  updateCartCount();
};

// Делегирование: один обработчик click на контейнере вместо обработчика на каждой кнопке.
// После перерисовки фокус возвращается на ту же кнопку, чтобы не терять место при работе с клавиатуры.
const delegateActions = (container, rerender) => {
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || !container.contains(button)) {
      return; // клик не по кнопке действия
    }
    const holder = button.closest("[data-id]");
    const item = findItem(Number(holder.dataset.id));
    const { action } = button.dataset;
    applyAction(item, action);
    rerender();

    const selector = `[data-id="${item.id}"] [data-action="${action}"]`;
    const again = container.querySelector(selector);
    const fallback = container.querySelector(`[data-id="${item.id}"] [data-action]:not([disabled])`);
    (again && !again.disabled ? again : fallback)?.focus();
  });
};

// ------------------------------------------------------------ каталог
// Перед отрисовкой контейнер очищается через replaceChildren, поэтому карточки не дублируются
const renderCatalog = (container, items) => {
  container.replaceChildren(...items.map((item) => item.render(isInCart(item.id))));
};

// Категория, выбранная в фильтре над каталогом (пустая строка — все категории)
const getSelectedCategory = () => {
  const select = document.querySelector("#category-filter");
  return select && select.value ? select.selectedOptions[0].textContent : "";
};

const initCatalog = () => {
  const container = document.querySelector("#catalog-container");
  if (!container) {
    return; // скрипт подключён ко всем страницам, каталог есть только на одной
  }

  const category = getSelectedCategory();
  const getVisible = () => (category ? state.equipment.filter((item) => item.category === category) : state.equipment);
  const rerender = () => renderCatalog(container, getVisible());
  rerender();
  delegateActions(container, rerender);

  const aside = document.querySelector(".page__aside");
  if (aside) {
    renderRentCalculator(aside, state.equipment);
  } else {
    logRentCost(calcRentCost(state.equipment));
  }
};

// ------------------------------------------------------------ подробная страница
// Форма «Добавить в корзину»: срок берётся из поля ввода, страница не перезагружается
const initDetail = () => {
  const form = document.querySelector("#detail-cart-form");
  if (!form) {
    return;
  }
  const item = findItem(Number(form.dataset.id));
  const daysInput = form.elements.days;
  const status = form.querySelector(".form__status");
  if (!item) {
    return;
  }
  daysInput.value = item.days;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    item.setDays(Number(daysInput.value));
    daysInput.value = item.days;
    saveEquipment();
    addToCart(item.id);
    updateCartCount();
    status.textContent = `Добавлено в корзину на ${formatDays(item.days)}: аренда ${formatMoney(item.getRent())}, залог ${formatMoney(item.deposit)}.`;
  });
};

// ------------------------------------------------------------ аналитика (вариант 19)
// Итоговая стоимость аренды всех позиций категории с учётом залога.
// По заданию варианта — палатки на 7 дней, это значения по умолчанию.
const calcRentCost = (items, category = "Палатки", days = 7) => {
  const rows = items
    .filter((item) => item.category === category)
    .map((item) => ({
      "Наименование": item.name,
      "Аренда": item.pricePerDay * days,
      "Залог": item.deposit,
      "Итого": item.getRentCost(days),
    }));
  const total = rows.reduce((sum, row) => sum + row["Итого"], 0);
  return { category, days, rows, total };
};

const logRentCost = ({ category, days, rows, total }) => {
  console.log(`Аренда категории «${category}» на ${days} дн. с учётом залога:`);
  console.table(rows);
  console.log(`Итоговая стоимость: ${formatMoney(total)}`);
};

// Результат расчёта: список позиций и итог
const renderRentCost = (target, { rows, total }) => {
  const el = Equipment.createElement;
  const list = el("ul", "section__list");
  rows.forEach((row) => {
    list.append(el("li", "section__item", `${row["Наименование"]}: ${formatMoney(row["Итого"])}`));
  });
  const result = el("p", "section__text");
  result.append("Итого с залогом: ", el("strong", "section__accent", formatMoney(total)));
  target.replaceChildren(list, result);
};

// Поле формы с подписью: <p class="form__row"><label>…</label><input|select></p>
const createField = (control, id, labelText) => {
  const el = Equipment.createElement;
  const row = el("p", "form__row");
  const label = el("label", "form__label", labelText);
  label.setAttribute("for", id);
  control.setAttribute("id", id);
  row.append(label, control);
  return row;
};

// Блок аналитики в боковой панели: выбор категории и срока, пересчёт при изменении
const renderRentCalculator = (target, items) => {
  const el = Equipment.createElement;
  const section = el("section", "page__section section section_note");
  section.setAttribute("aria-labelledby", "rent-cost-title");
  const title = el("h2", "section__title", "Расчёт аренды с залогом");
  title.setAttribute("id", "rent-cost-title");

  const select = el("select", "form__input");
  const categories = [...new Set(items.map((item) => item.category))];
  categories.forEach((name) => select.append(new Option(name, name)));
  select.value = "Палатки";

  const daysInput = el("input", "form__input form__input_short");
  daysInput.setAttribute("type", "number");
  daysInput.setAttribute("min", "1");
  daysInput.setAttribute("max", "30");
  daysInput.value = "7";

  const controls = el("div", "form");
  controls.append(
    createField(select, "rent-category", "Категория:"),
    createField(daysInput, "rent-days", "Срок аренды, дней:"),
  );

  const output = el("div", "section__result");
  output.setAttribute("aria-live", "polite"); // экранный диктор озвучит новый итог

  const update = () => {
    const days = Number(daysInput.value);
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      output.replaceChildren(el("p", "section__text", "Укажите срок от 1 до 30 дней."));
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
  update(); // первый расчёт: палатки на 7 дней
};

// ------------------------------------------------------------ корзина (страница «Список аренды»)
const createCell = (tag, className, content) => {
  const cell = Equipment.createElement(tag, className);
  cell.append(content);
  return cell;
};

// Строка таблицы корзины: <tr data-id="…">
const renderCartRow = (item) => {
  const el = Equipment.createElement;
  const row = el("tr", "table__row");
  row.dataset.id = item.id;

  const link = el("a", "link", item.name);
  link.setAttribute("href", `/detail.html?id=${item.id}`);
  const remove = Equipment.createActionButton("table__remove button button_secondary", "remove", "Убрать");
  remove.setAttribute("aria-label", `Убрать из корзины: ${item.name}`);

  row.append(
    createCell("th", "table__cell", link),
    createCell("td", "table__cell", item.renderCounter("table__counter")),
    createCell("td", "table__cell table__cell_num", formatMoney(item.pricePerDay)),
    createCell("td", "table__cell table__cell_num", formatMoney(item.getRent())),
    createCell("td", "table__cell table__cell_num", formatMoney(item.deposit)),
    createCell("td", "table__cell", remove),
  );
  row.firstChild.setAttribute("scope", "row");
  return row;
};

const renderCart = (container) => {
  const el = Equipment.createElement;
  const items = getCartItems();
  if (!items.length) {
    const empty = el("p", "page__text", "Корзина пуста. Выберите снаряжение в ");
    const link = el("a", "link", "каталоге");
    link.setAttribute("href", "/catalog.html");
    empty.append(link, ".");
    container.replaceChildren(empty);
    return;
  }

  const table = el("table", "table");
  const caption = el("caption", "table__caption", "Снаряжение в корзине");
  const head = el("thead", "");
  const headRow = el("tr", "");
  ["Наименование", "Срок аренды", "Цена за сутки", "Аренда за срок", "Залог", "Действие"].forEach((text) => {
    const th = el("th", "table__head", text);
    th.setAttribute("scope", "col");
    headRow.append(th);
  });
  head.append(headRow);

  const body = el("tbody", "");
  body.append(...items.map(renderCartRow));

  const { rent, deposit, total } = calcTotals(items);
  const foot = el("tfoot", "table__foot");
  const sumRow = el("tr", "");
  const sumTitle = createCell("th", "table__cell table__cell_num", "Итого");
  sumTitle.setAttribute("scope", "row");
  sumTitle.setAttribute("colspan", "3");
  sumRow.append(
    sumTitle,
    createCell("td", "table__cell table__cell_num", formatMoney(rent)),
    createCell("td", "table__cell table__cell_num", formatMoney(deposit)),
    el("td", "table__cell"),
  );
  const totalRow = el("tr", "");
  const totalTitle = createCell("th", "table__cell table__cell_num", "К оплате при получении (аренда + залог)");
  totalTitle.setAttribute("scope", "row");
  totalTitle.setAttribute("colspan", "3");
  const totalValue = createCell("td", "table__cell table__cell_num", el("strong", "", formatMoney(total)));
  totalValue.setAttribute("colspan", "3");
  totalRow.append(totalTitle, totalValue);
  foot.append(sumRow, totalRow);

  table.append(caption, head, body, foot);
  const wrapper = el("div", "page__section page__table");
  wrapper.append(table);

  const next = el("p", "page__text");
  const checkoutLink = el("a", "button", "Оформить заявку на аренду");
  checkoutLink.setAttribute("href", "/checkout.html");
  next.append(checkoutLink);

  container.replaceChildren(wrapper, next);
};

// ------------------------------------------------------------ заявки
const formatDate = (iso) => new Date(iso).toLocaleDateString("ru-RU");

// Карточка заявки в списке «Мои заявки»
const renderOrder = (order) => {
  const el = Equipment.createElement;
  const card = el("li", "orders__item order");
  card.dataset.id = order.id;

  const title = el("h3", "order__title", `Заявка № ${order.id} от ${formatDate(order.createdAt)}`);
  const customer = el("p", "order__text",
    `${order.customer.lastName} ${order.customer.firstName}, ${order.customer.phone}. ` +
    `Поход: ${formatDate(order.trip.startDate)} – ${formatDate(order.trip.endDate)}, участников: ${order.trip.people}.`);

  const list = el("ul", "order__list");
  order.items.forEach((line) => {
    list.append(el("li", "order__line", `${line.name} — ${formatDays(line.days)}: ${formatMoney(line.rent)}, залог ${formatMoney(line.deposit)}`));
  });

  const total = el("p", "order__total");
  total.append(
    `Аренда ${formatMoney(order.rent)} + залог ${formatMoney(order.deposit)} = `,
    el("strong", "", formatMoney(order.total)),
  );
  const pickup = el("p", "order__text", `Получение: ${order.pickup.point}, ${order.pickup.time}.`);

  card.append(title, customer, list, total, pickup);
  return card;
};

const renderOrders = (container) => {
  const el = Equipment.createElement;
  if (!state.orders.length) {
    container.replaceChildren(el("p", "page__text", "Заявок пока нет."));
    return;
  }
  const list = el("ul", "orders");
  // новые заявки сверху
  list.append(...state.orders.slice().reverse().map(renderOrder));
  container.replaceChildren(list);
};

const initCollection = () => {
  const cartContainer = document.querySelector("#cart-container");
  if (cartContainer) {
    const rerender = () => renderCart(cartContainer);
    rerender();
    delegateActions(cartContainer, rerender);
  }
  const ordersContainer = document.querySelector("#orders-container");
  if (ordersContainer) {
    renderOrders(ordersContainer);
  }
};

// ------------------------------------------------------------ оформление заявки (форма, вариант 19)
const renderCheckoutSummary = (container, submitButton) => {
  const el = Equipment.createElement;
  const items = getCartItems();
  const title = el("h2", "total__title", "Итоговый расчёт аренды");
  submitButton.disabled = !items.length;

  if (!items.length) {
    const text = el("p", "total__text", "Корзина пуста. Перед оформлением заявки выберите снаряжение в ");
    const link = el("a", "total__link", "каталоге");
    link.setAttribute("href", "/catalog.html");
    text.append(link, ".");
    container.replaceChildren(title, text);
    return;
  }

  const { count, rent, deposit, total } = calcTotals(items);
  const first = el("p", "total__text");
  first.append(
    `Позиций: ${count}. Аренда: `, el("strong", "total__value", formatMoney(rent)),
    ", залог: ", el("strong", "total__value", formatMoney(deposit)), ".",
  );
  const second = el("p", "total__text");
  const link = el("a", "total__link", "Изменить корзину");
  link.setAttribute("href", "/collection.html");
  second.append("К оплате при получении: ", el("strong", "total__value total__value_accent", formatMoney(total)), " ", link);
  container.replaceChildren(title, first, second);
};

// Новый объект заявки из данных формы и корзины.
// Паспортные данные в браузере не сохраняются: они нужны только при подписании договора в пункте проката.
const createOrder = (form, items) => {
  const data = new FormData(form);
  const value = (name) => String(data.get(name) ?? "").trim();
  const lines = items.map((item) => ({
    id: item.id,
    name: item.name,
    days: item.days,
    pricePerDay: item.pricePerDay,
    rent: item.getRent(),
    deposit: item.deposit,
  }));
  const { rent, deposit, total } = calcTotals(items);
  const point = form.elements.pickup_point_id;

  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    customer: {
      lastName: value("last_name"),
      firstName: value("first_name"),
      middleName: value("middle_name"),
      phone: value("phone"),
      email: value("email"),
    },
    trip: {
      startDate: value("start_date"),
      endDate: value("end_date"),
      people: Number(value("people")),
    },
    pickup: {
      method: value("pickup_method"),
      point: point.selectedOptions[0].textContent,
      time: value("pickup_time"),
    },
    comment: value("comment"),
    items: lines,
    rent,
    deposit,
    total,
  };
};

const showOrderMessage = (target, title, text, isError) => {
  const el = Equipment.createElement;
  const box = el("div", `alert${isError ? " alert_error" : ""}`);
  box.append(el("p", "alert__title", title), text);
  target.replaceChildren(box);
  target.focus();
};

const initCheckout = () => {
  const form = document.querySelector("#rental-form");
  if (!form) {
    return;
  }
  const summary = document.querySelector("#checkout-summary");
  const result = document.querySelector("#order-result");
  const submitButton = form.querySelector('[type="submit"]');
  renderCheckoutSummary(summary, submitButton);

  // submit срабатывает только после встроенной проверки полей (required, pattern, min, max)
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // страница не перезагружается, данные не уходят на сервер

    const items = getCartItems();
    if (!items.length) {
      showOrderMessage(result, "Корзина пуста", "Добавьте снаряжение в каталоге.", true);
      return;
    }
    if (form.elements.end_date.value < form.elements.start_date.value) {
      showOrderMessage(result, "Проверьте даты", "Дата окончания похода не может быть раньше даты начала.", true);
      form.elements.end_date.focus();
      return;
    }

    const order = createOrder(form, items);
    state.orders.push(order);
    saveOrders();
    state.cart = [];
    saveCart();
    console.log("Новая заявка сохранена в localStorage:", order);

    form.reset();
    renderCheckoutSummary(summary, submitButton);
    updateCartCount();

    const text = Equipment.createElement("p", "", `Аренда ${formatMoney(order.rent)}, залог ${formatMoney(order.deposit)}, к оплате при получении ${formatMoney(order.total)}. Все заявки — на странице `);
    const link = Equipment.createElement("a", "link", "«Список аренды»");
    link.setAttribute("href", "/collection.html");
    text.append(link, ".");
    showOrderMessage(result, `Заявка № ${order.id} принята`, text, false);
  });
};

// ------------------------------------------------------------ запуск
updateCartCount();
initCatalog();
initDetail();
initCollection();
initCheckout();
