// ЛР6. Модуль сетевых запросов: асинхронные функции для обмена данными
// с мок-сервером json-server (файл db.json) через Fetch API.

// Базовый URL сервера. При необходимости меняется в файле .env: VITE_API_URL=http://адрес:порт
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TIMEOUT_MS = 8000; // если сервер не ответил за 8 секунд, запрос прерывается

// Ошибка запроса: текст для пользователя и HTTP-статус (0 — сетевой сбой)
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Понятное сообщение для HTTP-статуса ошибки
const getStatusMessage = (status) => {
  if (status === 404) {
    return "Запрошенные данные не найдены на сервере (ошибка 404).";
  }
  if (status >= 500) {
    return `Сервер не смог обработать запрос (ошибка ${status}). Попробуйте позже.`;
  }
  return `Сервер отклонил запрос (ошибка ${status}).`;
};

// Общая функция запроса. Возвращает разобранный JSON или выбрасывает ApiError.
const request = async (path, { method = "GET", body } = {}) => {
  const options = {
    method,
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body); // объект → строка JSON
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    // Промис fetch не отклоняется при статусах 404 и 500, поэтому проверяем response.ok
    if (!response.ok) {
      throw new ApiError(getStatusMessage(response.status), response.status);
    }
    const data = await response.json(); // response.json() тоже возвращает промис
    console.info(`[API] ${method} ${path} → ${response.status}`, data);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`[API] ${method} ${path}: ${error.message}`);
      throw error;
    }
    // Сюда попадают сетевой сбой (TypeError), превышение времени ожидания и неверный JSON
    const message = error.name === "TimeoutError"
      ? "Сервер не ответил вовремя. Проверьте подключение и попробуйте ещё раз."
      : "Нет соединения с сервером. Проверьте подключение к сети и что мок-сервер запущен (npm run server).";
    console.error(`[API] ${method} ${path}: ${message}`, error);
    throw new ApiError(message);
  }
};

// ------------------------------------------------------------ GET-запросы
// Вариант 19: база доступного инвентаря
export const getEquipment = () => request("/equipment");

export const getEquipmentItem = (id) => request(`/equipment/${encodeURIComponent(id)}`);

export const getEquipmentByCategory = (categoryId) =>
  request(`/equipment?categoryId=${encodeURIComponent(categoryId)}`);

export const getCategories = () => request("/categories");

export const getPickupPoints = () => request("/pickupPoints");

// Оформленные договоры, новые сверху
export const getContracts = () => request("/contracts?_sort=-createdAt");

// ------------------------------------------------------------ POST-запрос
// Вариант 19: оформление договора аренды оборудования с указанием сроков.
// Сервер присваивает договору id и возвращает созданную запись.
export const createContract = (contract) => request("/contracts", { method: "POST", body: contract });
