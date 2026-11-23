<!-- Атомарный компонент: кнопка. Оформление задаётся props, текст передаётся через <slot> -->
<script setup>
defineProps({
  // Цветовой вариант: основная (оранжевая) или второстепенная (белая с рамкой)
  variant: {
    type: String,
    default: "primary",
    validator: (value) => ["primary", "secondary"].includes(value),
  },
  // Размер: m — обычная, s — компактная (в карточке)
  size: {
    type: String,
    default: "m",
    validator: (value) => ["s", "m"].includes(value),
  },
  // На всю ширину родителя
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "button",
  },
});
</script>

<template>
  <button
    class="button"
    :class="[`button_${variant}`, `button_size_${size}`, { button_block: block }]"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 18px;
  font-family: $font-main;
  font-size: 15px;
  font-weight: bold;
  color: $color-surface;
  text-decoration: none;
  background-color: $color-accent-dark;
  border: 2px solid $color-accent-dark;
  border-radius: $radius;
  cursor: pointer;
  transition: background-color $transition, transform $transition;

  &:hover:not(:disabled) {
    background-color: $color-accent-darker;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &_secondary {
    color: $color-primary-dark;
    background-color: $color-surface;
    border-color: $color-primary;

    &:hover:not(:disabled) {
      background-color: #e3efe6;
    }
  }

  &_size_s {
    min-height: 40px;
    padding: 6px 14px;
    font-size: 14px;
  }

  &_block {
    width: 100%;
  }
}
</style>
