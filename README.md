# Прокат туристического снаряжения «Привал» (СДР)

Учебный проект по дисциплине «Web-программирование», вариант 19.
Автор: Саяхов Даниэль, группа ИВТ-ПО-302Б.

ЛР6 «Асинхронный JavaScript, Fetch API и модульная сборка проекта»: проект собирается Vite,
данные загружаются с мок-сервера json-server (файл `db.json`) через Fetch API.

- **GET** — база доступного инвентаря (`/equipment`), категории и пункты проката при открытии страниц.
- **POST** — оформление договора аренды оборудования с указанием сроков (`/contracts`).
- Корзина и выбранные сроки аренды каждой позиции хранятся в `localStorage` браузера.

## Запуск

На macOS: двойной клик по файлу `start.command` (при первом запуске — правый клик → «Открыть»). Скрипт сам установит зависимости, запустит оба сервера и откроет сайт.

Вручную:

```
npm install
npm run server      # мок-сервер json-server: http://localhost:3000
npm run dev         # в другом окне терминала, сервер разработки Vite: http://localhost:5173
```

Сборка: `npm run build` (результат — папка `dist`), просмотр сборки: `npm run preview`.

## Страницы

| Адрес | Назначение | Запросы |
|---|---|---|
| `/index.html` | Главная | GET `/equipment`, `/categories` |
| `/catalog.html` | Каталог, фильтр по категории, срок «−/+», корзина | GET `/equipment`, `/categories` |
| `/detail.html?id=1` | Подробная страница снаряжения | GET `/equipment/:id`, `/equipment?categoryId=` |
| `/collection.html` | Корзина и оформленные договоры | GET `/equipment`, `/contracts` |
| `/checkout.html` | Форма договора аренды | GET `/equipment`, `/pickupPoints`; POST `/contracts` |
| `/credits.html` | Источники изображений | — |

## Структура проекта

```
index.html … credits.html   страницы (многостраничный режим Vite)
vite.config.js              конфигурация сборки, build.rollupOptions.input
db.json                     данные мок-сервера: equipment, categories, pickupPoints, contracts
public/images/              рисунки и фотографии снаряжения
src/main.js                 точка входа: стили и запуск кода страницы
src/api.js                  сетевые запросы (fetch, async/await, обработка ошибок)
src/ui.js                   работа с DOM: лоадер, скелетон, сообщения, делегирование
src/storage.js              localStorage: корзина и сроки аренды
src/equipment.js            класс Equipment и расчёты аренды
src/cart.js                 связь каталога с сервера и корзины
src/format.js               форматирование сумм и дат
src/pages/                  код отдельных страниц
src/scss/                   стили SCSS (БЭМ)
```

Версия проекта на Flask + SQLite (ЛР1–ЛР5) сохранена в истории Git, ветки `feature/lab1` – `feature/lab5`.
