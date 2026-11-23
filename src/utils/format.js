// Форматирование чисел для вывода в шаблонах компонентов

// 8000 → «8 000 ₽»
export const formatMoney = (value) => `${value.toLocaleString("ru-RU")} ₽`;

// 6.5 → «6,5»
export const formatNumber = (value) => value.toLocaleString("ru-RU");
