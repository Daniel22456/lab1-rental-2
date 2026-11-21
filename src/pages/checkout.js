// Страница оформления договора: GET пунктов проката и каталога,
// POST /contracts — договор аренды оборудования с указанием сроков (вариант 19)
import { createContract, getPickupPoints } from "../api.js";
import { getCartItems, loadEquipment } from "../cart.js";
import { calcTotals } from "../equipment.js";
import { countDays, formatDays, formatMoney, toInputDate } from "../format.js";
import { clearCart } from "../storage.js";
import { createElement, createLink, showError, showLoader, showMessage, updateCartCount } from "../ui.js";

// Ограничения дат: поход не в прошлом, арендатору не меньше 18 лет
const setDateLimits = (form) => {
  const today = new Date();
  const adult = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  form.elements.start_date.min = toInputDate(today);
  form.elements.end_date.min = toInputDate(today);
  form.elements.passport_date.max = toInputDate(today);
  form.elements.birth_date.max = toInputDate(adult);
};

const fillPickupPoints = (select, points) => {
  select.replaceChildren(
    new Option("— выберите пункт —", ""),
    ...points.map((p) => new Option(`${p.name}, ${p.address} (${p.hours})`, p.id)),
  );
  select.disabled = false;
};

const renderSummary = (container, items) => {
  const title = createElement("h2", "total__title", "Итоговый расчёт аренды");
  if (!items.length) {
    const text = createElement("p", "total__text", "Корзина пуста. Перед оформлением договора выберите снаряжение в ");
    text.append(createLink("total__link", "/catalog.html", "каталоге"), ".");
    container.replaceChildren(title, text);
    return;
  }
  const { count, rent, deposit, total } = calcTotals(items);
  const first = createElement("p", "total__text");
  first.append(
    `Позиций: ${count}. Аренда: `, createElement("strong", "total__value", formatMoney(rent)),
    ", залог: ", createElement("strong", "total__value", formatMoney(deposit)), ".",
  );
  const second = createElement("p", "total__text");
  second.append(
    "К оплате при получении: ", createElement("strong", "total__value total__value_accent", formatMoney(total)), " ",
    createLink("total__link", "/collection.html", "Изменить корзину"),
  );
  container.replaceChildren(title, first, second);
};

// Объект договора для POST-запроса.
// Паспортные данные на сервер не отправляются: они сверяются при подписании договора в пункте проката.
const createContractData = (form, items) => {
  const data = new FormData(form);
  const value = (name) => String(data.get(name) ?? "").trim();
  const { rent, deposit, total } = calcTotals(items);
  const point = form.elements.pickup_point_id;
  const startDate = value("start_date");
  const endDate = value("end_date");

  return {
    createdAt: new Date().toISOString(),
    status: "new",
    customer: {
      lastName: value("last_name"),
      firstName: value("first_name"),
      middleName: value("middle_name"),
      phone: value("phone"),
      email: value("email"),
    },
    period: { startDate, endDate, days: countDays(startDate, endDate) }, // сроки аренды
    people: Number(value("people")),
    items: items.map((item) => ({
      equipmentId: item.id,
      name: item.name,
      days: item.days,
      pricePerDay: item.pricePerDay,
      rent: item.getRent(),
      deposit: item.deposit,
    })),
    pickup: {
      method: value("pickup_method"),
      pointId: point.value,
      point: point.selectedOptions[0].textContent,
      time: value("pickup_time"),
    },
    comment: value("comment"),
    rent,
    deposit,
    total,
  };
};

// Проверки, которые не выразить атрибутами HTML
const validatePeriod = (form, items) => {
  const { start_date: start, end_date: end } = form.elements;
  if (end.value < start.value) {
    return { field: end, text: "Дата окончания аренды не может быть раньше даты начала." };
  }
  const period = countDays(start.value, end.value);
  const longest = Math.max(...items.map((item) => item.days));
  if (longest > period) {
    return { field: end, text: `Срок аренды позиции в корзине (${formatDays(longest)}) больше периода аренды (${formatDays(period)}). Измените даты или сроки в корзине.` };
  }
  return null;
};

export const initCheckout = () => {
  const form = document.querySelector("#rental-form");
  const summary = document.querySelector("#checkout-summary");
  const result = document.querySelector("#order-result");
  const status = document.querySelector("#checkout-status");
  const submitButton = form.querySelector('[type="submit"]');
  let items = [];
  setDateLimits(form);

  // GET: каталог (для расчёта корзины) и пункты проката — параллельно
  const load = async () => {
    showLoader(status, "Загрузка корзины и пунктов проката…");
    submitButton.disabled = true;
    try {
      const [equipment, points] = await Promise.all([loadEquipment(), getPickupPoints()]);
      items = getCartItems(equipment);
      fillPickupPoints(form.elements.pickup_point_id, points);
      status.replaceChildren();
      status.removeAttribute("aria-busy");
      renderSummary(summary, items);
      submitButton.disabled = !items.length;
    } catch (error) {
      showError(status, error, load);
    }
  };

  // POST: отправка договора. submit срабатывает после встроенной проверки полей (required, pattern, min, max)
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!items.length) {
      showMessage(result, "Корзина пуста", "Добавьте снаряжение в каталоге.", true);
      return;
    }
    const problem = validatePeriod(form, items);
    if (problem) {
      showMessage(result, "Проверьте сроки аренды", problem.text, true);
      problem.field.focus();
      return;
    }

    const contract = createContractData(form, items);
    submitButton.disabled = true;
    submitButton.textContent = "Отправка…";
    showLoader(result, "Отправка договора на сервер…");
    try {
      const saved = await createContract(contract); // ответ 201 Created с id договора
      result.removeAttribute("aria-busy");
      clearCart();
      items = [];
      form.reset();
      renderSummary(summary, items);
      updateCartCount(0);

      const text = createElement("p", "", `Срок аренды: ${formatDays(saved.period.days)}. Аренда ${formatMoney(saved.rent)}, залог ${formatMoney(saved.deposit)}, к оплате при получении ${formatMoney(saved.total)}. Договор сохранён на сервере, все договоры — на странице `);
      text.append(createLink("link", "/collection.html", "«Список аренды»"), ".");
      showMessage(result, `Договор № ${saved.id} оформлен`, text);
    } catch (error) {
      // Корзина и данные формы сохраняются — можно отправить ещё раз
      result.removeAttribute("aria-busy");
      showMessage(result, "Договор не отправлен", `${error.message} Данные формы сохранены, попробуйте отправить ещё раз.`, true);
    } finally {
      submitButton.textContent = "Отправить договор";
      submitButton.disabled = !items.length;
    }
  });

  load();
};
