# Прокат туристического снаряжения «Привал» (СДР)

Учебный проект по дисциплине «Web-программирование», вариант 19.
Автор: Саяхов Даниэль, группа ИВТ-ПО-302Б.

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
│   ├── ItemList.vue         сетка каталога (props: items)
│   │   └── EquipmentCard.vue × 15   карточка снаряжения (вариант 19)
│   │       ├── BaseBadge.vue        «В наличии» / «Нет на складе»
│   │       └── BaseButton.vue       «Выбрать», :disabled="!inStock"
│   └── BaseBadge.vue × 2    сводка по наличию
├── PageSection.vue «Условия аренды» (variant="note")
│   └── BaseButton.vue
└── AppFooter.vue            подвал (props: author, year)
```

## Структура

```
index.html                 контейнер <div id="app">
src/main.js                createApp(App).mount("#app")
src/App.vue                корневой компонент
src/components/            однофайловые компоненты .vue
src/data/equipment.js      исходные данные: 15 позиций снаряжения
src/utils/format.js        форматирование сумм и чисел
src/assets/scss/           глобальные переменные, миксины, сброс, макросетка
public/images/             изображения
```

Версии проекта ЛР1–ЛР6 (Flask + SQLite, затем Vite + json-server) сохранены в истории Git, ветки `feature/lab1` – `feature/lab6`.
