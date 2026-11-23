<!-- Атомарный компонент: бейдж (метка). Цвет задаётся props, текст — через <slot> -->
<script setup>
defineProps({
  variant: {
    type: String,
    default: "neutral",
    validator: (value) => ["neutral", "success", "muted", "accent"].includes(value),
  },
});
</script>

<template>
  <span class="badge" :class="`badge_${variant}`">
    <slot />
  </span>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.badge {
  display: inline-block;
  align-self: flex-start;
  padding: 2px 10px;
  font-size: 13px;
  font-weight: bold;
  line-height: 1.6;
  border: 1px solid transparent;
  border-radius: 12px;

  &_neutral {
    color: $color-text;
    background-color: $color-bg;
    border-color: $color-border;
  }

  // В наличии
  &_success {
    color: $color-primary-dark;
    background-color: #e3efe6;
    border-color: $color-primary;
  }

  // Нет на складе
  &_muted {
    color: $color-surface;
    background-color: $color-muted;
  }

  &_accent {
    color: $color-accent-darker;
    background-color: #fbeadb;
    border-color: $color-accent;
  }
}
</style>
