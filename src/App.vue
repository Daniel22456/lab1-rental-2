<!-- Корневой компонент (ЛР7, вариант 19, СДР): макет страницы и передача данных дочерним компонентам -->
<script setup>
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";
import BaseBadge from "./components/BaseBadge.vue";
import BaseButton from "./components/BaseButton.vue";
import ItemList from "./components/ItemList.vue";
import PageSection from "./components/PageSection.vue";
import { equipment } from "./data/equipment.js";

const author = "Саяхов Даниэль, ИВТ-ПО-302Б";

const navItems = [
  { href: "#about", text: "О сервисе" },
  { href: "#catalog", text: "Каталог", active: true },
  { href: "#terms", text: "Условия аренды" },
];

// Сводка по каталогу для подвала секции
const inStockCount = equipment.filter((item) => item.inStock).length;
const categories = [...new Set(equipment.map((item) => item.category))];
</script>

<template>
  <div class="page page_sidebar">
    <a class="page__skip link" href="#main">Перейти к содержимому</a>

    <AppHeader class="page__header" :nav-items="navItems" />

    <main id="main" class="page__main" tabindex="-1">
      <h1 class="page__title">
        Прокат туристического снаряжения «Привал» — <abbr :title="author">СДР</abbr>
      </h1>

      <!-- Заголовок передан через prop title: используется содержимое слота header по умолчанию -->
      <PageSection id="about" class="page__section" title="О сервисе">
        <p class="section__text">
          «Привал» — сервис проката туристического снаряжения для пеших, водных и автомобильных походов.
          Снаряжение можно взять в аренду ровно на нужное количество дней: от выходных за городом
          до двухнедельного маршрута.
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

        <ItemList :items="equipment" />

        <template #footer>
          <span>Всего позиций: {{ equipment.length }}.</span>
          <BaseBadge variant="success">В наличии: {{ inStockCount }}</BaseBadge>
          <BaseBadge variant="muted">Нет на складе: {{ equipment.length - inStockCount }}</BaseBadge>
        </template>
      </PageSection>
    </main>

    <aside class="page__aside" aria-label="Дополнительная информация">
      <PageSection id="terms" variant="note">
        <template #header>
          <h2 class="section__title">Условия аренды</h2>
        </template>

        <ul class="section__list">
          <li>Стоимость аренды = цена за сутки × количество суток.</li>
          <li>Залог вносится при получении и возвращается после сдачи снаряжения.</li>
          <li>Срок аренды каждой позиции — от 1 до 30 суток.</li>
          <li>Договор заключается с совершеннолетним арендатором по паспорту.</li>
        </ul>

        <template #footer>
          <BaseButton variant="secondary" block>Связаться с пунктом проката</BaseButton>
        </template>
      </PageSection>
    </aside>

    <AppFooter class="page__footer" :author="author" :year="2026" />
  </div>
</template>
