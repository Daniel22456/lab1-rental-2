// Модуль интерфейса: создание элементов DOM, индикатор загрузки,
// сообщения об ошибках и делегирование событий

// Элемент с БЭМ-классом и, если нужно, текстом
export const createElement = (tag, className = "", text) => {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
};

// Кнопка с действием для делегирования: <button data-action="…">
export const createActionButton = (className, action, text, label) => {
  const button = createElement("button", className, text);
  button.setAttribute("type", "button");
  button.dataset.action = action;
  if (label) {
    button.setAttribute("aria-label", label);
  }
  return button;
};

// Ссылка
export const createLink = (className, href, text) => {
  const link = createElement("a", className, text);
  link.setAttribute("href", href);
  return link;
};

// ------------------------------------------------------------ состояния загрузки
// Индикатор загрузки: спиннер и подпись. aria-busy сообщает экранному диктору, что блок обновляется
export const showLoader = (container, text = "Загрузка данных с сервера…") => {
  const loader = createElement("div", "loader");
  loader.setAttribute("role", "status");
  loader.append(createElement("span", "loader__spinner"), createElement("p", "loader__text", text));
  container.replaceChildren(loader);
  container.setAttribute("aria-busy", "true");
};

// Скелетон каталога: серые карточки на месте будущих
export const showSkeleton = (list, count = 6) => {
  const cards = Array.from({ length: count }, () => {
    const card = createElement("li", "catalog__item skeleton");
    card.setAttribute("aria-hidden", "true");
    card.append(
      createElement("div", "skeleton__block skeleton__block_image"),
      createElement("div", "skeleton__block skeleton__block_line skeleton__block_short"),
      createElement("div", "skeleton__block skeleton__block_line"),
      createElement("div", "skeleton__block skeleton__block_line skeleton__block_short"),
    );
    return card;
  });
  list.replaceChildren(...cards);
  list.setAttribute("aria-busy", "true");
};

// Скрывает индикатор: содержимое заменит следующая отрисовка
export const hideLoader = (container) => {
  container.removeAttribute("aria-busy");
  container.querySelector(":scope > .loader")?.remove();
};

// Сообщение об ошибке с кнопкой «Повторить запрос»
export const showError = (container, error, onRetry) => {
  const box = createElement("div", "alert alert_error");
  box.setAttribute("role", "alert");
  box.append(
    createElement("p", "alert__title", "Не удалось загрузить данные"),
    createElement("p", "alert__text", error.message),
  );
  if (onRetry) {
    const retry = createElement("button", "alert__retry button button_secondary", "Повторить запрос");
    retry.setAttribute("type", "button");
    retry.addEventListener("click", onRetry, { once: true });
    box.append(retry);
  }
  container.replaceChildren(box);
  container.removeAttribute("aria-busy");
};

// Итог действия пользователя (успех или ошибка отправки)
export const showMessage = (target, title, content, isError = false) => {
  const box = createElement("div", `alert${isError ? " alert_error" : ""}`);
  box.setAttribute("role", isError ? "alert" : "status");
  box.append(createElement("p", "alert__title", title), content);
  target.replaceChildren(box);
  target.focus();
};

// Счётчик корзины в пункте меню «Список аренды (N)» на всех страницах
export const updateCartCount = (count) => {
  document.querySelectorAll("[data-cart-count]").forEach((counter) => {
    counter.textContent = count;
  });
};

// ------------------------------------------------------------ делегирование (ЛР5)
// Один обработчик click на контейнере вместо обработчика на каждой кнопке.
// После перерисовки фокус возвращается на ту же кнопку.
export const delegateActions = (container, onAction, rerender) => {
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || !container.contains(button)) {
      return;
    }
    const { id } = button.closest("[data-id]").dataset;
    const { action } = button.dataset;
    onAction(id, action);
    rerender();

    const again = container.querySelector(`[data-id="${id}"] [data-action="${action}"]`);
    const fallback = container.querySelector(`[data-id="${id}"] [data-action]:not([disabled])`);
    (again && !again.disabled ? again : fallback)?.focus();
  });
};
