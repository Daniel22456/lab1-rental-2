<!-- Корневой компонент (ЛР8, вариант 19, СДР): реактивное состояние каталога и списка аренды,
     фильтрация и сортировка (computed), обработка событий карточек, сохранение в localStorage -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";
import BaseBadge from "./components/BaseBadge.vue";
import CatalogFilters from "./components/CatalogFilters.vue";
import CheckoutForm from "./components/CheckoutForm.vue";
import ItemList from "./components/ItemList.vue";
import PageSection from "./components/PageSection.vue";
import RentalList from "./components/RentalList.vue";
import { equipment as equipmentData } from "./data/equipment.js";
import { formatDate, formatDays, formatMoney } from "./utils/format.js";
import { loadJSON, saveJSON } from "./utils/storage.js";

const author = "Саяхов Даниэль, ИВТ-ПО-302Б";
const STORAGE_RENTAL = "privalRentalList";
const STORAGE_ORDERS = "privalApplications";
const MIN_DAYS = 1;
const MAX_DAYS = 30;

const navItems = [
  { href: "#about", text: "О сервисе" },
  { href: "#catalog", text: "Каталог", active: true },
  { href: "#rental", text: "Список аренды" },
  { href: "#checkout", text: "Оформление договора" },
  { href: "#terms", text: "Условия аренды" },
];

// ------------------------------------------------------------ реактивное состояние
const equipment = ref([]);        // исходный массив каталога
const rentalList = ref([]);       // коллекция: [{ id, days }]
const applications = ref([]);     // оформленные заявки на договор
const lastApplication = ref(null);
const isLoading = ref(true);

// Поиск, фильтры и сортировка связаны с полями CatalogFilters через v-model
const search = ref("");
const category = ref("");
const inStockOnly = ref(false);
const sortBy = ref("default");

// ------------------------------------------------------------ жизненный цикл и localStorage
onMounted(() => {
  equipment.value = equipmentData.map((item) => ({ ...item }));
  rentalList.value = loadJSON(STORAGE_RENTAL, []);
  applications.value = loadJSON(STORAGE_ORDERS, []);
  isLoading.value = false;
});

// deep: true — сохранять и при изменении срока внутри элемента массива
watch(rentalList, (list) => saveJSON(STORAGE_RENTAL, list), { deep: true });
watch(applications, (list) => saveJSON(STORAGE_ORDERS, list), { deep: true });

// ------------------------------------------------------------ фильтрация и сортировка (вариант 19)
const categories = computed(() => [...new Set(equipment.value.map((item) => item.category))]);

const sorters = {
  "rate-asc": (a, b) => a.dailyRate - b.dailyRate,
  "rate-desc": (a, b) => b.dailyRate - a.dailyRate,
  "weight-asc": (a, b) => a.weightKg - b.weightKg,
  "weight-desc": (a, b) => b.weightKg - a.weightKg,
};

const filteredAndSortedItems = computed(() => {
  const query = search.value.toLowerCase();
  const result = equipment.value
    .filter((item) => item.title.toLowerCase().includes(query))          // поиск по наименованию
    .filter((item) => !category.value || item.category === category.value) // категория экипировки
    .filter((item) => !inStockOnly.value || item.inStock);                  // «В наличии на складе»
  const sorter = sorters[sortBy.value];
  return sorter ? [...result].sort(sorter) : result;                       // сортировка копии массива
});

const resetFilters = () => {
  search.value = "";
  category.value = "";
  inStockOnly.value = false;
  sortBy.value = "default";
};

// ------------------------------------------------------------ обработчики событий карточки
const findRental = (id) => rentalList.value.find((entry) => entry.id === id);

// add-rental: добавление снаряжения в список аренды
const onAddRental = (id) => {
  const item = equipment.value.find((entry) => entry.id === id);
  if (item?.inStock && !findRental(id)) {
    rentalList.value.push({ id, days: MIN_DAYS });
  }
};

// change-days: изменение срока аренды (1–30 дней)
const onChangeDays = ({ id, days }) => {
  const entry = findRental(id);
  if (entry) {
    entry.days = Math.min(MAX_DAYS, Math.max(MIN_DAYS, days));
  }
};

const onRemoveRental = (id) => {
  rentalList.value = rentalList.value.filter((entry) => entry.id !== id);
};

// ------------------------------------------------------------ вычисляемые итоги коллекции
// Сроки аренды для карточек: { [id]: days }
const rentalDays = computed(() => Object.fromEntries(rentalList.value.map((entry) => [entry.id, entry.days])));

const rentalItems = computed(() => rentalList.value
  .map((entry) => {
    const item = equipment.value.find((candidate) => candidate.id === entry.id);
    return item ? { ...item, days: entry.days, rent: item.dailyRate * entry.days } : null;
  })
  .filter(Boolean));

const totalRent = computed(() => rentalItems.value.reduce((sum, item) => sum + item.rent, 0));
const totalDeposit = computed(() => rentalItems.value.reduce((sum, item) => sum + item.depositAmount, 0));
const totalWeight = computed(() => Math.round(rentalItems.value.reduce((sum, item) => sum + item.weightKg, 0) * 10) / 10);

const rentalTotals = computed(() => ({
  count: rentalItems.value.length,
  rent: totalRent.value,
  deposit: totalDeposit.value,
  weight: totalWeight.value,
  total: totalRent.value + totalDeposit.value,
}));

const inStockCount = computed(() => equipment.value.filter((item) => item.inStock).length);

// ------------------------------------------------------------ итоговая заявка из формы
const onSubmitApplication = (form) => {
  const application = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    customer: { fullName: form.fullName, phone: form.phone, email: form.email },
    period: { startDate: form.startDate, endDate: form.endDate, days: form.periodDays },
    people: form.people,
    pickupPoint: form.pickupPoint,
    comment: form.comment,
    items: rentalItems.value.map(({ id, title, days, dailyRate, rent, depositAmount, weightKg }) => (
      { id, title, days, dailyRate, rent, deposit: depositAmount, weightKg })),
    totals: { ...rentalTotals.value },
  };
  applications.value.push(application);
  lastApplication.value = application;
  rentalList.value = [];
};
</script>

<template>
  <div class="page page_sidebar">
    <a class="page__skip link" href="#main">Перейти к содержимому</a>

    <AppHeader class="page__header" :nav-items="navItems" :rental-totals="rentalTotals" />

    <main id="main" class="page__main" tabindex="-1">
      <h1 class="page__title">
        Прокат туристического снаряжения «Привал» — <abbr :title="author">СДР</abbr>
      </h1>

      <PageSection id="about" class="page__section" title="О сервисе">
        <p class="section__text">
          «Привал» — сервис проката туристического снаряжения для пеших, водных и автомобильных походов.
          Выберите снаряжение, укажите срок аренды каждой позиции и оформите договор:
          стоимость, залог и вес комплекта пересчитываются сразу.
        </p>
        <template #footer>
          <span>Категории:</span>
          <BaseBadge v-for="name in categories" :key="name">{{ name }}</BaseBadge>
        </template>
      </PageSection>

      <PageSection id="catalog" class="page__section">
        <template #header>
          <h2 class="section__title">Каталог снаряжения</h2>
        </template>

        <CatalogFilters
          v-model:search="search"
          v-model:category="category"
          v-model:in-stock-only="inStockOnly"
          v-model:sort-by="sortBy"
          :categories="categories"
          :found="filteredAndSortedItems.length"
          :total="equipment.length"
          @reset="resetFilters"
        />

        <p v-if="isLoading" class="section__text" role="status">Загружаем каталог…</p>
        <ItemList
          v-else
          :items="filteredAndSortedItems"
          :rental-days="rentalDays"
          @add-rental="onAddRental"
          @change-days="onChangeDays"
          @reset="resetFilters"
        />

        <template #footer>
          <span>Всего позиций: {{ equipment.length }}.</span>
          <BaseBadge variant="success">В наличии: {{ inStockCount }}</BaseBadge>
          <BaseBadge variant="muted">Нет на складе: {{ equipment.length - inStockCount }}</BaseBadge>
        </template>
      </PageSection>

      <PageSection id="checkout" class="page__section">
        <template #header>
          <h2 class="section__title">Оформление договора аренды</h2>
        </template>

        <div v-if="lastApplication" class="page__notice" role="status">
          <p class="page__notice-title">Заявка № {{ lastApplication.id }} принята</p>
          <p class="page__notice-text">
            {{ lastApplication.customer.fullName }}, срок договора
            {{ formatDate(lastApplication.period.startDate) }} – {{ formatDate(lastApplication.period.endDate) }}
            ({{ formatDays(lastApplication.period.days) }}). Позиций: {{ lastApplication.totals.count }},
            аренда {{ formatMoney(lastApplication.totals.rent) }}, залог {{ formatMoney(lastApplication.totals.deposit) }},
            к оплате при получении {{ formatMoney(lastApplication.totals.total) }}.
          </p>
        </div>

        <CheckoutForm
          :items-count="rentalTotals.count"
          :total="rentalTotals.total"
          @submit="onSubmitApplication"
        />

        <template #footer>
          <span>Оформлено заявок: {{ applications.length }}.</span>
        </template>
      </PageSection>
    </main>

    <aside class="page__aside" aria-label="Список аренды и условия">
      <PageSection id="rental" class="page__section" variant="note">
        <template #header>
          <h2 class="section__title">Список аренды</h2>
        </template>

        <RentalList
          :items="rentalItems"
          :totals="rentalTotals"
          @change-days="onChangeDays"
          @remove-rental="onRemoveRental"
        />
      </PageSection>

      <PageSection id="terms" class="page__section">
        <template #header>
          <h2 class="section__title">Условия аренды</h2>
        </template>

        <ul class="section__list">
          <li>Стоимость аренды = цена за сутки × количество суток.</li>
          <li>Залог вносится при получении и возвращается после сдачи снаряжения.</li>
          <li>Срок аренды каждой позиции — от 1 до 30 суток.</li>
          <li>Договор заключается с совершеннолетним арендатором по паспорту.</li>
        </ul>
      </PageSection>
    </aside>

    <AppFooter class="page__footer" :author="author" :year="2026" />
  </div>
</template>
