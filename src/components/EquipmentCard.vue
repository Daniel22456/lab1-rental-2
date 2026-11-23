<!-- Карточка снаряжения (вариант 19). Все данные приходят от родителя через props -->
<script setup>
import { formatMoney, formatNumber } from "../utils/format.js";
import BaseBadge from "./BaseBadge.vue";
import BaseButton from "./BaseButton.vue";

// Входные параметры варианта 19 и параметры изображения
defineProps({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  dailyRate: {          // цена аренды за сутки, ₽
    type: Number,
    required: true,
  },
  depositAmount: {      // залог, ₽
    type: Number,
    required: true,
  },
  weightKg: {
    type: Number,
    required: true,
  },
  inStock: {            // есть ли снаряжение на складе
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imageAlt: {
    type: String,
    default: "",
  },
  features: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <!-- :class добавляет полупрозрачный модификатор, если снаряжения нет на складе -->
  <article class="equipment-card" :class="{ 'equipment-card_rented': !inStock }">
    <div class="equipment-card__media">
      <img
        class="equipment-card__image"
        :src="imageUrl"
        :alt="imageAlt"
        width="400"
        height="300"
        loading="lazy"
      >
      <p v-if="!inStock" class="equipment-card__overlay">В аренде</p>
    </div>

    <div class="equipment-card__body">
      <BaseBadge :variant="inStock ? 'success' : 'muted'">
        {{ inStock ? "В наличии" : "Нет на складе" }}
      </BaseBadge>
      <p class="equipment-card__category">{{ category }}</p>
      <h3 class="equipment-card__title">{{ title }}</h3>
      <p class="equipment-card__text">
        {{ features.join(", ") }}, вес {{ formatNumber(weightKg) }} кг
      </p>
      <p class="equipment-card__deposit">Залог: {{ formatMoney(depositAmount) }}</p>

      <div class="equipment-card__footer">
        <p class="equipment-card__price">
          <strong class="equipment-card__price-value">{{ formatMoney(dailyRate) }}</strong> / сутки
        </p>
        <!-- Кнопка выбора блокируется, если снаряжения нет на складе -->
        <BaseButton size="s" :disabled="!inStock" :aria-label="`Выбрать: ${title}`">
          {{ inStock ? "Выбрать" : "Нет в наличии" }}
        </BaseButton>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.equipment-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  transition: box-shadow $transition, transform $transition;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  // Вариант 19: снаряжения нет на складе — карточка полупрозрачная
  &_rented {
    opacity: 0.6;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  &__media {
    position: relative;
  }

  &__image {
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    font-size: 22px;
    font-weight: bold;
    text-transform: uppercase;
    color: $color-surface;
    background-color: rgba(0, 0, 0, 0.55);
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: $space-s;
    padding: $space-m;
  }

  &__category,
  &__title,
  &__text,
  &__deposit,
  &__price {
    margin: 0;
  }

  &__category {
    font-size: 13px;
    text-transform: uppercase;
    color: $color-muted;
  }

  &__title {
    font-family: $font-heading;
    font-size: 20px;
    line-height: 1.25;
    color: $color-primary-dark;
  }

  &__deposit {
    font-size: 14px;
    color: $color-muted;
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-s;
    margin-top: auto;
    padding-top: $space-s;
    border-top: 1px solid $color-border;
  }

  &__price {
    color: $color-accent-dark;
  }

  &__price-value {
    font-size: 20px;
  }
}
</style>
