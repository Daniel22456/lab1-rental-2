<!-- Компонент-оболочка: блок страницы с тремя именованными слотами (header, default, footer) -->
<script setup>
defineProps({
  // Заголовок по умолчанию, если родитель не передал слот header
  title: {
    type: String,
    default: "",
  },
  // default — белый блок, note — блок с дополнительной информацией
  variant: {
    type: String,
    default: "default",
    validator: (value) => ["default", "note"].includes(value),
  },
});
</script>

<template>
  <section class="section" :class="{ section_note: variant === 'note' }">
    <div class="section__header">
      <slot name="header">
        <h2 class="section__title">{{ title }}</h2>
      </slot>
    </div>

    <div class="section__body">
      <slot />
    </div>

    <!-- Подвал выводится, только если родитель передал содержимое слота footer -->
    <div v-if="$slots.footer" class="section__footer">
      <slot name="footer" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;
@use "../assets/scss/mixins" as *;

.section {
  @include box;
  padding: $space-m;

  @include tablet {
    padding: $space-l;
  }

  &__title {
    margin: 0 0 $space-m;
    font-family: $font-heading;
    font-size: 22px;
    line-height: 1.25;
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $space-s;
    margin-top: $space-m;
    padding-top: $space-m;
    font-size: 14px;
    color: $color-muted;
    border-top: 1px solid $color-border;
  }

  &_note {
    background-color: #fbeadb;
    border-color: $color-accent;
  }
}

// Содержимое слотов принадлежит родителю, поэтому стили к нему применяются через :slotted
:slotted(.section__title) {
  margin: 0 0 $space-m;
  font-family: $font-heading;
  font-size: 22px;
  line-height: 1.25;
}

:slotted(.section__text),
:slotted(.section__list) {
  margin: 0 0 $space-m;
}

:slotted(.section__list) {
  padding-left: $space-l;
}
</style>
