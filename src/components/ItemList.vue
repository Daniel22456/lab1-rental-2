<!-- Компонент-контейнер: сетка каталога. Выводит карточки в цикле v-for
     и передаёт события карточек родителю (App.vue) -->
<script setup>
import BaseButton from "./BaseButton.vue";
import EquipmentCard from "./EquipmentCard.vue";

defineProps({
  items: {
    type: Array,
    required: true,
  },
  // Сроки аренды позиций из списка аренды: { [id]: days }
  rentalDays: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["add-rental", "change-days", "reset"]);
</script>

<template>
  <ul v-if="items.length > 0" class="catalog">
    <!-- :key — уникальный id позиции, по нему Vue отличает элементы списка -->
    <li v-for="item in items" :key="item.id" class="catalog__item">
      <EquipmentCard
        :id="item.id"
        :title="item.title"
        :category="item.category"
        :daily-rate="item.dailyRate"
        :deposit-amount="item.depositAmount"
        :weight-kg="item.weightKg"
        :in-stock="item.inStock"
        :image-url="item.imageUrl"
        :image-alt="item.imageAlt"
        :features="item.features"
        :rental-days="rentalDays[item.id] ?? 0"
        @add-rental="emit('add-rental', $event)"
        @change-days="emit('change-days', $event)"
      />
    </li>
  </ul>

  <!-- Пустое состояние: по фильтрам ничего не найдено -->
  <div v-else class="catalog__empty" role="status">
    <p class="catalog__empty-title">Ничего не найдено</p>
    <p class="catalog__empty-text">Измените строку поиска или условия фильтра.</p>
    <BaseButton variant="secondary" @click="emit('reset')">Сбросить фильтры</BaseButton>
  </div>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

// Сетка карточек (Grid): число колонок браузер считает сам — 1 на телефоне, 2–3 на ПК
.catalog {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: $space-l;
  margin: 0;
  padding: 0;
  list-style: none;

  &__empty {
    padding: $space-l;
    text-align: center;
    background-color: $color-bg;
    border: 2px dashed $color-border;
    border-radius: $radius;
  }

  &__empty-title {
    margin: 0 0 $space-s;
    font-family: $font-heading;
    font-size: 22px;
    color: $color-primary-dark;
  }

  &__empty-text {
    margin: 0 0 $space-m;
    color: $color-muted;
  }
}
</style>
