<!-- Шапка сайта: логотип, название и навигационное меню (пункты меню приходят через props) -->
<script setup>
import { formatMoney, formatNumber } from "../utils/format.js";

defineProps({
  // Пункты меню: [{ href: "#catalog", text: "Каталог", active: true }, …]
  navItems: {
    type: Array,
    required: true,
  },
  logoUrl: {
    type: String,
    default: "/images/logo.svg",
  },
  // ЛР8: итоги списка аренды (computed в App.vue): { count, rent, deposit, weight }
  rentalTotals: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <a class="header__logo-link" href="#main" aria-label="«Привал» — к началу страницы">
        <img class="header__logo" :src="logoUrl" alt="" width="48" height="48">
      </a>
      <p class="header__brand">
        <strong class="header__name">«Привал»</strong> — прокат туристического снаряжения
      </p>
      <!-- ЛР8: итоги списка аренды обновляются реактивно -->
      <a class="header__rental" href="#rental">
        <template v-if="rentalTotals.count > 0">
          Список аренды: {{ rentalTotals.count }} поз. · {{ formatMoney(rentalTotals.rent) }}
          · залог {{ formatMoney(rentalTotals.deposit) }} · {{ formatNumber(rentalTotals.weight) }} кг
        </template>
        <template v-else>Список аренды пуст</template>
      </a>
      <nav class="header__nav nav" aria-label="Основная навигация">
        <ul class="nav__list">
          <li v-for="item in navItems" :key="item.href" class="nav__item">
            <a
              class="nav__link"
              :class="{ nav__link_active: item.active }"
              :href="item.href"
              :aria-current="item.active ? 'location' : null"
            >{{ item.text }}</a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;
@use "../assets/scss/mixins" as *;

.header {
  color: $color-surface;
  background-color: $color-primary-dark;
  border-bottom: 4px solid $color-accent;

  &__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $space-s $space-m;
    max-width: $container;
    margin: 0 auto;
    padding: $space-m;
  }

  &__logo-link {
    display: flex;
    flex-shrink: 0;
    border-radius: 50%;
    transition: transform $transition;

    &:hover {
      transform: rotate(-10deg);
    }

    &:focus-visible {
      outline-color: $color-surface;
    }
  }

  &__logo {
    width: 48px;
    height: 48px;
  }

  &__brand {
    flex: 1 1 200px;
    margin: 0;
  }

  &__name {
    display: block;
    font-family: $font-heading;
    font-size: 22px;
  }

  &__rental {
    flex-basis: 100%;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: bold;
    color: $color-surface;
    text-decoration: none;
    background-color: rgba(255, 255, 255, 0.12);
    border-radius: $radius;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    &:focus-visible {
      outline-color: $color-surface;
    }
  }

  &__nav {
    flex-basis: 100%;
  }

  @include tablet {
    &__name {
      display: inline;
      font-size: 24px;
    }
  }

  @include desktop {
    &__nav {
      flex-basis: auto;
      margin-left: auto;
    }
  }
}

.nav {
  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: $space-s;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__link {
    display: flex;
    align-items: center;
    min-height: 40px;
    padding: 4px 14px;
    font-weight: bold;
    color: $color-surface;
    text-decoration: none;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 20px;
    transition: background-color $transition, color $transition;

    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }

    &:focus-visible {
      outline-color: $color-surface;
    }

    &_active {
      color: $color-text;
      background-color: $color-surface;

      &:hover {
        background-color: $color-surface;
      }
    }
  }
}
</style>
