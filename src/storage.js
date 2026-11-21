// Модуль локального состояния пользователя (localStorage).
// ЛР6: каталог и договоры хранятся на сервере, а корзина и выбранные сроки
// аренды остаются в браузере (допускается примечанием к заданию).

const KEYS = {
  cart: "privalCart", // id позиций в корзине
  days: "privalDays", // срок аренды каждой позиции: { "1": 5, "3": 2 }
};
const LEGACY_EQUIPMENT = "privalEquipment"; // ключ ЛР5: в нём хранился весь массив снаряжения

export const MIN_DAYS = 1;
export const MAX_DAYS = 30;

const read = (key, fallback) => {
  try {
    const json = localStorage.getItem(key);
    return json === null ? fallback : JSON.parse(json);
  } catch (error) {
    console.warn(`Не удалось прочитать «${key}» из localStorage:`, error);
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Не удалось сохранить «${key}» в localStorage:`, error);
  }
};

const clampDays = (value) => Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(Number(value)) || MIN_DAYS));

// Переход с ЛР5: сроки берутся из старого массива снаряжения, сам массив удаляется,
// потому что каталог теперь приходит с сервера
const migrateLegacy = () => {
  const legacy = read(LEGACY_EQUIPMENT, null);
  if (!Array.isArray(legacy)) {
    return {};
  }
  const days = Object.fromEntries(legacy.map((item) => [String(item.id), clampDays(item.days)]));
  write(KEYS.days, days);
  localStorage.removeItem(LEGACY_EQUIPMENT);
  return days;
};

// id приводятся к строкам: json-server хранит идентификаторы строками
let cart = [...new Set(read(KEYS.cart, []).map(String))];
let days = read(KEYS.days, null) ?? migrateLegacy();

// ------------------------------------------------------------ корзина
export const getCart = () => [...cart];
export const isInCart = (id) => cart.includes(String(id));

export const addToCart = (id) => {
  if (!isInCart(id)) {
    cart.push(String(id));
    write(KEYS.cart, cart);
  }
};

export const removeFromCart = (id) => {
  cart = cart.filter((cartId) => cartId !== String(id));
  write(KEYS.cart, cart);
};

export const toggleCart = (id) => (isInCart(id) ? removeFromCart(id) : addToCart(id));

export const clearCart = () => {
  cart = [];
  write(KEYS.cart, cart);
};

// Убирает из корзины позиции, которых больше нет в каталоге на сервере
export const pruneCart = (existingIds) => {
  const ids = new Set(existingIds.map(String));
  const filtered = cart.filter((id) => ids.has(id));
  if (filtered.length !== cart.length) {
    cart = filtered;
    write(KEYS.cart, cart);
  }
};

// ------------------------------------------------------------ сроки аренды
export const getDays = (id) => days[String(id)] ?? MIN_DAYS;

export const setDays = (id, value) => {
  const result = clampDays(value);
  days = { ...days, [String(id)]: result };
  write(KEYS.days, days);
  return result;
};
