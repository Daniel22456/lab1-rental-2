# Прокат туристического снаряжения «Привал» (СДР)

Учебный проект по дисциплине «Web-программирование», вариант 19.
Автор: Саяхов Даниэль, группа ИВТ-ПО-302Б.

ЛР8 «Реактивность, директивы, обработка событий и формы во Vue.js»:
поиск, фильтры и сортировка каталога через `computed`, события карточки `add-rental` и `change-days`
(`defineEmits`), список аренды с итогами (стоимость, залог, вес комплекта), форма договора с `v-model`
и реактивной проверкой полей, сохранение списка аренды и заявок в `localStorage` через `watch`.

ЛР7 «Введение во Vue.js: однофайловые компоненты (SFC), декларативная отрисовка и входные параметры (Props)»:
клиентская часть переведена на Vue 3 и Vite, интерфейс разбит на однофайловые компоненты.

## Запуск

На macOS: двойной клик по файлу `start.command` (при первом запуске — правый клик → «Открыть»).

Вручную:

```
npm install
npm run dev        # http://localhost:5173, панель Vue DevTools — Alt+Shift+D
```

Сборка: `npm run build` (папка `dist`), просмотр сборки: `npm run preview`.

## Дерево компонентов

```
App.vue
├── AppHeader.vue            шапка: логотип и меню (props: navItems)
├── PageSection.vue «О сервисе»        слоты header / default / footer
│   └── BaseBadge.vue × 4    категории
├── PageSection.vue «Каталог»
│   ├── CatalogFilters.vue   поиск, категория, «В наличии», сортировка (v-model)
│   ├── ItemList.vue         сетка каталога или «Ничего не найдено» (v-if / v-else)
│   │   └── EquipmentCard.vue × 15   карточка (emits: add-rental, change-days)
│   │       ├── BaseBadge.vue        «В наличии» / «Нет на складе»
│   │       └── BaseButton.vue       «В список аренды», :disabled="!inStock"
│   └── BaseBadge.vue × 2    сводка по наличию
├── PageSection.vue «Оформление договора»
│   └── CheckoutForm.vue     форма договора (reactive, v-model, @submit.prevent)
├── PageSection.vue «Список аренды» (variant="note")
│   └── RentalList.vue       позиции, сроки и итоги (emits: change-days, remove-rental)
├── PageSection.vue «Условия аренды»
└── AppFooter.vue            подвал (props: author, year)
```

## Структура

```
index.html                 контейнер <div id="app">
src/main.js                createApp(App).mount("#app")
src/App.vue                корневой компонент
src/components/            однофайловые компоненты .vue
src/data/equipment.js      исходные данные: 15 позиций снаряжения
src/data/pickupPoints.js   пункты проката для формы договора
src/utils/format.js        форматирование сумм, чисел, дней и дат
src/utils/storage.js       чтение и запись JSON в localStorage
src/assets/scss/           глобальные переменные, миксины, сброс, макросетка
public/images/             изображения
```

Версии проекта ЛР1–ЛР6 (Flask + SQLite, затем Vite + json-server) сохранены в истории Git, ветки `feature/lab1` – `feature/lab7`.
