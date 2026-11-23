<!-- Подвал сайта: контакты, режим работы и сведения о разработчике -->
<script setup>
defineProps({
  author: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  phone: {
    type: String,
    default: "+7 (347) 000-00-00",
  },
  email: {
    type: String,
    default: "info@privaltour.example",
  },
});
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <address class="footer__item">
        Телефон: <a class="footer__link" :href="`tel:${phone.replace(/[^\d+]/g, '')}`">{{ phone }}</a><br>
        Почта: <a class="footer__link" :href="`mailto:${email}`">{{ email }}</a>
      </address>
      <p class="footer__item">Пункты проката работают ежедневно с 9:00 до 20:00.</p>
      <p class="footer__item footer__item_wide">
        <small>© {{ year }} Прокат «Привал». Учебный проект. Разработчик: {{ author }}
          (<abbr :title="author">СДР</abbr>).</small>
      </p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;
@use "../assets/scss/mixins" as *;

.footer {
  font-size: 14px;
  color: #d8ddd9;
  background-color: $color-text;

  &__inner {
    display: flex;
    flex-direction: column;
    gap: $space-m;
    max-width: $container;
    margin: 0 auto;
    padding: $space-l $space-m;
  }

  &__item {
    margin: 0;
    font-style: normal;
  }

  @include tablet {
    &__inner {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    &__item {
      flex: 1 1 200px;

      &_wide {
        flex-basis: 100%;
        padding-top: $space-m;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
      }
    }
  }

  &__link {
    color: $color-surface;
    transition: color $transition;

    &:hover {
      color: $color-accent;
    }

    &:focus-visible {
      outline-color: $color-surface;
    }
  }
}
</style>
