<!-- Карточка снаряжения (вариант 19). Данные приходят через props, действия уходят родителю событиями (defineEmits) -->
<script setup>
import { formatDays, formatMoney, formatNumber } from "../utils/format.js";
import BaseBadge from "./BaseBadge.vue";
import BaseButton from "./BaseButton.vue";

// Входные параметры варианта 19 и параметры изображения
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
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
  // ЛР8: срок аренды в списке аренды; 0 — позиции в списке нет
  rentalDays: {
    type: Number,
    default: 0,
  },
});

// ЛР8, вариант 19: события карточки с проверкой передаваемых данных
const emit = defineEmits({
  "add-rental": (id) => Number.isInteger(id),
  "change-days": ({ id, days }) => Number.isInteger(id) && Number.isInteger(days),
});

const MIN_DAYS = 1;
const MAX_DAYS = 30;

const changeDays = (step) => {
  emit("change-days", { id: props.id, days: props.rentalDays + step });
};
</script>

<template>
  <article class="equipment-card" :class="{ 'equipment-card_rented': !inStock, 'equipment-card_selected': rentalDays > 0 }">
    <!-- :class выше добавляет полупрозрачный модификатор, если снаряжения нет на складе -->
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

        <!-- Позиции нет в списке аренды: кнопка добавления (блокируется, если нет на складе) -->
        <BaseButton
          v-if="rentalDays === 0"
          size="s"
          :disabled="!inStock"
          :aria-label="`В список аренды: ${title}`"
          @click="emit('add-rental', id)"
        >
          {{ inStock ? "В список аренды" : "Нет в наличии" }}
        </BaseButton>

        <!-- Позиция в списке: выбор срока аренды кнопками «−» и «+» -->
        <div v-else class="equipment-card__rental">
          <div class="equipment-card__counter" role="group" :aria-label="`Срок аренды: ${title}`">
            <button
              class="equipment-card__step"
              type="button"
              aria-label="Уменьшить срок на 1 день"
              :disabled="rentalDays <= MIN_DAYS"
              @click="changeDays(-1)"
            >−</button>
            <output class="equipment-card__days">{{ formatDays(rentalDays) }}</output>
            <button
              class="equipment-card__step"
              type="button"
              aria-label="Увеличить срок на 1 день"
              :disabled="rentalDays >= MAX_DAYS"
              @click="changeDays(1)"
            >+</button>
          </div>
          <p class="equipment-card__cost">
            В списке аренды: <strong>{{ formatMoney(dailyRate * rentalDays) }}</strong>
          </p>
        </div>
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

  // ЛР8: позиция добавлена в список аренды
  &_selected {
    border-color: $color-accent-dark;
    box-shadow: 0 0 0 2px $color-accent-dark;
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

  // ЛР8: срок аренды позиции из списка аренды
  &__rental {
    display: flex;
    flex-basis: 100%;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-s;
  }

  &__counter {
    display: flex;
    align-items: center;
    gap: $space-s;
  }

  &__step {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    font: inherit;
    font-size: 20px;
    font-weight: bold;
    color: $color-primary-dark;
    background-color: $color-surface;
    border: 2px solid $color-primary;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color $transition, color $transition;

    &:hover:not(:disabled) {
      color: $color-surface;
      background-color: $color-primary;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  &__days {
    min-width: 4.5em;
    font-weight: bold;
    text-align: center;
  }

  &__cost {
    margin: 0;
    font-size: 14px;
  }
}
</style>
