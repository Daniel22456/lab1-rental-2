// Форматирование чисел, дат и слов для вывода на страницу

export const formatMoney = (value) => `${value.toLocaleString("ru-RU")} ₽`;

// Выбор формы слова: plural(5, "день", "дня", "дней") → «дней»
export const plural = (count, one, few, many) => {
  const last = count % 10;
  const lastTwo = count % 100;
  if (last === 1 && lastTwo !== 11) {
    return one;
  }
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return few;
  }
  return many;
};

// 1 день, 2 дня, 5 дней
export const formatDays = (count) => `${count} ${plural(count, "день", "дня", "дней")}`;

// "2026-11-21" или ISO-время → 21.11.2026
export const formatDate = (value) => new Date(value).toLocaleDateString("ru-RU");

// Дата в формате YYYY-MM-DD по местному времени (для атрибутов min и max полей date)
export const toInputDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Число суток между датами включительно: с 01.07 по 03.07 — 3 дня
export const countDays = (start, end) => {
  const DAY = 24 * 60 * 60 * 1000;
  return Math.round((new Date(end) - new Date(start)) / DAY) + 1;
};
