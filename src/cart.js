// Связь данных с сервера и корзины пользователя
import { getEquipment } from "./api.js";
import { Equipment } from "./equipment.js";
import * as storage from "./storage.js";
import { updateCartCount } from "./ui.js";

// GET /equipment → массив экземпляров Equipment со сроками из localStorage.
// После JSON-ответа объекты не имеют методов, поэтому каждый оборачивается в класс.
export const loadEquipment = async () => {
  const data = await getEquipment();
  const items = data.map((item) => new Equipment(item, storage.getDays(item.id)));
  storage.pruneCart(items.map((item) => item.id));
  updateCartCount(storage.getCart().length);
  return items;
};

export const findItem = (items, id) => items.find((item) => item.id === String(id));

// Позиции корзины в порядке добавления
export const getCartItems = (items) =>
  storage.getCart().map((id) => findItem(items, id)).filter(Boolean);

// Общая обработка кнопок «−», «+», «В корзину», «Убрать»
export const applyAction = (item, action) => {
  if (action === "increase" || action === "decrease") {
    item.setDays(item.days + (action === "increase" ? 1 : -1));
    storage.setDays(item.id, item.days);
  } else if (action === "cart") {
    storage.toggleCart(item.id);
  } else if (action === "remove") {
    storage.removeFromCart(item.id);
  }
  updateCartCount(storage.getCart().length);
};
