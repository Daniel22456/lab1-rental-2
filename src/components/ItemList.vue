<!-- Компонент-контейнер: сетка каталога. Принимает массив данных и выводит карточки в цикле v-for -->
<script setup>
import EquipmentCard from "./EquipmentCard.vue";

defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <ul v-if="items.length" class="catalog">
    <!-- :key — уникальный id позиции, по нему Vue отличает элементы списка -->
    <li v-for="item in items" :key="item.id" class="catalog__item">
      <EquipmentCard
        :title="item.title"
        :category="item.category"
        :daily-rate="item.dailyRate"
        :deposit-amount="item.depositAmount"
        :weight-kg="item.weightKg"
        :in-stock="item.inStock"
        :image-url="item.imageUrl"
        :image-alt="item.imageAlt"
        :features="item.features"
      />
    </li>
  </ul>
  <p v-else class="catalog__empty">В каталоге пока нет снаряжения.</p>
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
    margin: 0;
    color: $color-muted;
  }
}
</style>
