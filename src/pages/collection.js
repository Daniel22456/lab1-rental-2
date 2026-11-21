// Страница «Список аренды»: корзина (данные позиций — с сервера, состав — из localStorage)
// и оформленные договоры (GET /contracts)
import { getContracts } from "../api.js";
import { applyAction, findItem, getCartItems, loadEquipment } from "../cart.js";
import { calcTotals } from "../equipment.js";
import { formatDate, formatDays, formatMoney } from "../format.js";
import { createActionButton, createElement, createLink, delegateActions, showError, showLoader } from "../ui.js";

const createCell = (tag, className, content) => {
  const cell = createElement(tag, className);
  cell.append(content);
  return cell;
};

const renderCartRow = (item) => {
  const row = createElement("tr", "table__row");
  row.dataset.id = item.id;
  const remove = createActionButton("table__remove button button_secondary", "remove", "Убрать", `Убрать из корзины: ${item.name}`);
  row.append(
    createCell("th", "table__cell", createLink("link", `/detail.html?id=${item.id}`, item.name)),
    createCell("td", "table__cell", item.renderCounter("table__counter")),
    createCell("td", "table__cell table__cell_num", formatMoney(item.pricePerDay)),
    createCell("td", "table__cell table__cell_num", formatMoney(item.getRent())),
    createCell("td", "table__cell table__cell_num", formatMoney(item.deposit)),
    createCell("td", "table__cell", remove),
  );
  row.firstChild.setAttribute("scope", "row");
  return row;
};

const renderCart = (container, allItems) => {
  const items = getCartItems(allItems);
  if (!items.length) {
    const empty = createElement("p", "page__text", "Корзина пуста. Выберите снаряжение в ");
    empty.append(createLink("link", "/catalog.html", "каталоге"), ".");
    container.replaceChildren(empty);
    return;
  }

  const table = createElement("table", "table");
  const head = createElement("thead");
  const headRow = createElement("tr");
  ["Наименование", "Срок аренды", "Цена за сутки", "Аренда за срок", "Залог", "Действие"].forEach((text) => {
    const th = createElement("th", "table__head", text);
    th.setAttribute("scope", "col");
    headRow.append(th);
  });
  head.append(headRow);

  const body = createElement("tbody");
  body.append(...items.map(renderCartRow));

  const { rent, deposit, total } = calcTotals(items);
  const foot = createElement("tfoot", "table__foot");
  const sumRow = createElement("tr");
  const sumTitle = createCell("th", "table__cell table__cell_num", "Итого");
  sumTitle.setAttribute("scope", "row");
  sumTitle.setAttribute("colspan", "3");
  sumRow.append(
    sumTitle,
    createCell("td", "table__cell table__cell_num", formatMoney(rent)),
    createCell("td", "table__cell table__cell_num", formatMoney(deposit)),
    createElement("td", "table__cell"),
  );
  const totalRow = createElement("tr");
  const totalTitle = createCell("th", "table__cell table__cell_num", "К оплате при получении (аренда + залог)");
  totalTitle.setAttribute("scope", "row");
  totalTitle.setAttribute("colspan", "3");
  const totalValue = createCell("td", "table__cell table__cell_num", createElement("strong", "", formatMoney(total)));
  totalValue.setAttribute("colspan", "3");
  totalRow.append(totalTitle, totalValue);
  foot.append(sumRow, totalRow);

  table.append(createElement("caption", "table__caption", "Снаряжение в корзине"), head, body, foot);
  const wrapper = createElement("div", "page__section page__table");
  wrapper.append(table);
  const next = createElement("p", "page__text");
  next.append(createLink("button", "/checkout.html", "Оформить договор аренды"));
  container.replaceChildren(wrapper, next);
};

// Карточка договора, полученного с сервера
const renderContract = (contract) => {
  const card = createElement("li", "orders__item order");
  card.dataset.id = contract.id;
  const { customer, period, pickup } = contract;

  const list = createElement("ul", "order__list");
  contract.items.forEach((line) => {
    list.append(createElement("li", "order__line", `${line.name} — ${formatDays(line.days)}: ${formatMoney(line.rent)}, залог ${formatMoney(line.deposit)}`));
  });
  const total = createElement("p", "order__total");
  total.append(`Аренда ${formatMoney(contract.rent)} + залог ${formatMoney(contract.deposit)} = `, createElement("strong", "", formatMoney(contract.total)));

  card.append(
    createElement("h3", "order__title", `Договор № ${contract.id} от ${formatDate(contract.createdAt)}`),
    createElement("p", "order__text", `${customer.lastName} ${customer.firstName}, ${customer.phone}. ` +
      `Срок аренды: ${formatDate(period.startDate)} – ${formatDate(period.endDate)} (${formatDays(period.days)}), участников: ${contract.people}.`),
    list,
    total,
    createElement("p", "order__text", `Получение: ${pickup.point}, ${pickup.time}.`),
  );
  return card;
};

const renderContracts = (container, contracts) => {
  if (!contracts.length) {
    container.replaceChildren(createElement("p", "page__text", "Договоров пока нет."));
    return;
  }
  const list = createElement("ul", "orders");
  list.append(...contracts.map(renderContract));
  container.replaceChildren(list);
};

export const initCollection = () => {
  const cartContainer = document.querySelector("#cart-container");
  const contractsContainer = document.querySelector("#contracts-container");
  let items = [];

  const rerenderCart = () => renderCart(cartContainer, items);
  delegateActions(cartContainer, (id, action) => applyAction(findItem(items, id), action), rerenderCart);

  const loadCart = async () => {
    showLoader(cartContainer, "Загрузка корзины…");
    try {
      items = await loadEquipment();
      cartContainer.removeAttribute("aria-busy");
      rerenderCart();
    } catch (error) {
      showError(cartContainer, error, loadCart);
    }
  };

  const loadContracts = async () => {
    showLoader(contractsContainer, "Загрузка договоров с сервера…");
    try {
      const contracts = await getContracts();
      contractsContainer.removeAttribute("aria-busy");
      renderContracts(contractsContainer, contracts);
    } catch (error) {
      showError(contractsContainer, error, loadContracts);
    }
  };

  // Блоки независимы: запросы идут параллельно, ошибка одного не мешает другому
  loadCart();
  loadContracts();
};
