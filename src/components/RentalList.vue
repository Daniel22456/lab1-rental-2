<!-- Список аренды (пользовательская коллекция): позиции, сроки и итоги.
     Итоги считает родитель через computed() и передаёт сюда через props -->
<script setup>
import { formatDays, formatMoney, formatNumber } from "../utils/format.js";

defineProps({
  // [{ id, title, days, dailyRate, depositAmount, weightKg, rent }]
  items: {
    type: Array,
    required: true,
  },
  // { count, rent, deposit, weight, total }
  totals: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["change-days", "remove-rental"]);
</script>

<template>
  <div class="rental">
    <template v-if="items.length > 0">
      <ul class="rental__list">
        <li v-for="item in items" :key="item.id" class="rental__item">
          <p class="rental__title">{{ item.title }}</p>
          <div class="rental__row">
            <div class="rental__counter" role="group" :aria-label="`Срок аренды: ${item.title}`">
              <button
                class="rental__step"
                type="button"
                aria-label="Уменьшить срок на 1 день"
                :disabled="item.days <= 1"
                @click="emit('change-days', { id: item.id, days: item.days - 1 })"
              >−</button>
              <output class="rental__days">{{ formatDays(item.days) }}</output>
              <button
                class="rental__step"
                type="button"
                aria-label="Увеличить срок на 1 день"
                :disabled="item.days >= 30"
                @click="emit('change-days', { id: item.id, days: item.days + 1 })"
              >+</button>
            </div>
            <strong class="rental__sum">{{ formatMoney(item.rent) }}</strong>
          </div>
          <p class="rental__meta">
            Залог {{ formatMoney(item.depositAmount) }}, вес {{ formatNumber(item.weightKg) }} кг
            <button
              class="rental__remove"
              type="button"
              :aria-label="`Убрать из списка аренды: ${item.title}`"
              @click="emit('remove-rental', item.id)"
            >Убрать</button>
          </p>
        </li>
      </ul>

      <dl class="rental__totals">
        <dt class="rental__term">Позиций</dt>
        <dd class="rental__value">{{ totals.count }}</dd>
        <dt class="rental__term">Аренда за указанные дни</dt>
        <dd class="rental__value">{{ formatMoney(totals.rent) }}</dd>
        <dt class="rental__term">Возвратный залог</dt>
        <dd class="rental__value">{{ formatMoney(totals.deposit) }}</dd>
        <dt class="rental__term">Вес комплекта</dt>
        <dd class="rental__value">{{ formatNumber(totals.weight) }} кг</dd>
        <dt class="rental__term rental__grand">К оплате при получении</dt>
        <dd class="rental__value rental__grand">{{ formatMoney(totals.total) }}</dd>
      </dl>
    </template>

    <p v-else class="rental__empty">
      Список аренды пуст. Нажмите «В список аренды» на карточке в каталоге.
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.rental {
  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-s;
    margin: 0 0 $space-m;
    padding: 0;
    list-style: none;
  }

  &__item {
    padding: $space-s;
    background-color: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius;
  }

  &__title,
  &__meta,
  &__empty {
    margin: 0;
  }

  &__title {
    font-weight: bold;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-s;
    margin: 4px 0;
  }

  &__counter {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__step {
    width: 32px;
    height: 32px;
    padding: 0;
    font: inherit;
    font-size: 18px;
    font-weight: bold;
    color: $color-primary-dark;
    background-color: $color-surface;
    border: 2px solid $color-primary;
    border-radius: 50%;
    cursor: pointer;

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

  &__sum {
    color: $color-accent-dark;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    font-size: 14px;
    color: $color-muted;
  }

  &__remove {
    padding: 2px 8px;
    font: inherit;
    font-size: 14px;
    color: $color-error;
    background: none;
    border: 1px solid currentColor;
    border-radius: $radius;
    cursor: pointer;
  }

  &__totals {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px $space-s;
    margin: 0;
  }

  &__value {
    margin: 0;
    font-weight: bold;
    text-align: right;
    white-space: nowrap;
  }

  &__grand {
    padding-top: $space-s;
    font-size: 17px;
    color: $color-accent-dark;
    border-top: 1px solid $color-border;
  }
}
</style>
