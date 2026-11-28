// Чтение и запись JSON в localStorage (ЛР8: сохранение коллекции через watch)

export const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback; // хранилище недоступно или строка повреждена
  }
};

export const saveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Не удалось сохранить «${key}» в localStorage:`, error);
  }
};
