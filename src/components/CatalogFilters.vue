<!-- Панель поиска, фильтров и сортировки каталога (вариант 19).
     Значения хранятся в родителе (App.vue) и связаны с полями через v-model -->
<script setup>
import { computed } from "vue";
import BaseButton from "./BaseButton.vue";

// defineModel(): двустороннее связывание v-model:search, v-model:category и т. д.
const search = defineModel("search", { type: String, default: "" });
const category = defineModel("category", { type: String, default: "" });
const inStockOnly = defineModel("inStockOnly", { type: Boolean, default: false });
const sortBy = defineModel("sortBy", { type: String, default: "default" });

defineProps({
  categories: {
    type: Array,
    required: true,
  },
  found: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["reset"]);

const sortOptions = [
  { value: "default", text: "По порядку в каталоге" },
  { value: "rate-asc", text: "Суточная ставка: сначала дешевле" },
  { value: "rate-desc", text: "Суточная ставка: сначала дороже" },
  { value: "weight-asc", text: "Вес: сначала лёгкие" },
  { value: "weight-desc", text: "Вес: сначала тяжёлые" },
];

const isFiltered = computed(() => search.value !== "" || category.value !== "" || inStockOnly.value || sortBy.value !== "default");
</script>

<template>
  <form class="filters" role="search" aria-label="Поиск и фильтры каталога" @submit.prevent>
    <p class="filters__field filters__field_wide">
      <label class="filters__label" for="filter-search">Поиск по наименованию</label>
      <!-- .trim: пробелы по краям строки поиска не учитываются -->
      <input
        id="filter-search"
        v-model.trim="search"
        class="filters__input"
        type="search"
        placeholder="Например, палатка"
        autocomplete="off"
        @keydown.enter.prevent
      >
    </p>

    <p class="filters__field">
      <label class="filters__label" for="filter-category">Категория</label>
      <select id="filter-category" v-model="category" class="filters__input">
        <option value="">Все категории</option>
        <option v-for="name in categories" :key="name" :value="name">{{ name }}</option>
      </select>
    </p>

    <p class="filters__field">
      <label class="filters__label" for="filter-sort">Сортировка</label>
      <select id="filter-sort" v-model="sortBy" class="filters__input">
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
    </p>

    <p class="filters__check">
      <input id="filter-stock" v-model="inStockOnly" class="filters__checkbox" type="checkbox">
      <label for="filter-stock">В наличии на складе</label>
    </p>

    <div class="filters__summary">
      <p class="filters__found" role="status">Найдено: {{ found }} из {{ total }}</p>
      <!-- v-show: кнопка остаётся в DOM и только скрывается, пока фильтры не заданы -->
      <BaseButton v-show="isFiltered" variant="secondary" size="s" @click="emit('reset')">
        Сбросить фильтры
      </BaseButton>
    </div>
  </form>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;
@use "../assets/scss/mixins" as *;

.filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: $space-m;
  margin: 0 0 $space-l;
  padding: $space-m;
  background-color: $color-bg;
  border: 1px solid $color-border;
  border-radius: $radius;

  @include tablet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &__field,
  &__check,
  &__found {
    margin: 0;
  }

  &__field_wide {
    @include tablet {
      grid-column: 1 / -1;
    }
  }

  &__label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
  }

  &__input {
    width: 100%;
    min-height: 44px;
    padding: $space-s;
    font: inherit;
    background-color: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius;

    &:hover {
      border-color: $color-primary;
    }
  }

  &__check {
    display: flex;
    align-items: center;
    gap: $space-s;
    font-weight: bold;
  }

  &__checkbox {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: $color-primary;
  }

  &__summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-s;
  }

  &__found {
    color: $color-muted;
  }
}
</style>
