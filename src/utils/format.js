// Форматирование чисел для вывода в шаблонах компонентов

// 8000 → «8 000 ₽»
export const formatMoney = (value) => `${value.toLocaleString("ru-RU")} ₽`;

// 6.5 → «6,5»
export const formatNumber = (value) => value.toLocaleString("ru-RU");

// 1 день, 2 дня, 5 дней
export const formatDays = (count) => {
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

// 2026-12-01 → «01.12.2026»
export const formatDate = (value) => new Date(value).toLocaleDateString("ru-RU");
