<!-- Форма заявки на договор аренды (вариант 19). Поля связаны с reactive-объектом через v-model,
     ошибки проверяются реактивно (computed) и выводятся через v-if -->
<script setup>
import { computed, reactive, ref } from "vue";
import { pickupPoints } from "../data/pickupPoints.js";
import { formatDays, formatMoney } from "../utils/format.js";
import BaseButton from "./BaseButton.vue";

const props = defineProps({
  itemsCount: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits({
  submit: (application) => typeof application === "object" && application !== null,
});

const DAY_MS = 24 * 60 * 60 * 1000;
const today = new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  fullName: "",
  phone: "",
  email: "",
  startDate: "",
  endDate: "",
  people: 1,
  pickupPointId: "",
  comment: "",
  agree: false,
});

// Состояние формы: один reactive-объект для всех полей
const form = reactive(emptyForm());
// Поля, которые пользователь уже покинул: ошибку показываем после ухода из поля
const touched = reactive({});
const submitted = ref(false);

const periodDays = computed(() => {
  if (!form.startDate || !form.endDate || form.endDate < form.startDate) {
    return 0;
  }
  return Math.round((new Date(form.endDate) - new Date(form.startDate)) / DAY_MS) + 1;
});

// Реактивная валидация: объект ошибок пересчитывается при каждом изменении полей
const errors = computed(() => {
  const result = {};
  if (form.fullName.split(" ").filter(Boolean).length < 2) {
    result.fullName = "Укажите фамилию и имя через пробел.";
  }
  if (!/^\+7\d{10}$/.test(form.phone.replace(/[\s()-]/g, ""))) {
    result.phone = "Телефон в формате +7 999 123-45-67.";
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    result.email = "Проверьте адрес почты, например name@mail.ru.";
  }
  if (!form.startDate) {
    result.startDate = "Выберите дату начала аренды.";
  } else if (form.startDate < today) {
    result.startDate = "Дата начала не может быть в прошлом.";
  }
  if (!form.endDate) {
    result.endDate = "Выберите дату окончания аренды.";
  } else if (form.startDate && form.endDate < form.startDate) {
    result.endDate = "Дата окончания не может быть раньше даты начала.";
  }
  if (!Number.isInteger(form.people) || form.people < 1 || form.people > 20) {
    result.people = "Количество участников — целое число от 1 до 20.";
  }
  if (!form.pickupPointId) {
    result.pickupPointId = "Выберите пункт проката.";
  }
  if (!form.agree) {
    result.agree = "Подтвердите согласие с условиями аренды.";
  }
  return result;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

// Ошибку поля показываем, если пользователь покинул поле или нажал «Отправить»
const errorOf = (field) => ((submitted.value || touched[field]) ? errors.value[field] : "");

const onSubmit = () => {
  submitted.value = true;
  if (!isValid.value || props.itemsCount === 0) {
    return;
  }
  const point = pickupPoints.find((item) => item.id === form.pickupPointId);
  emit("submit", {
    ...form,
    pickupPoint: `${point.name}, ${point.address}`,
    periodDays: periodDays.value,
  });
  // очистка формы после отправки
  Object.assign(form, emptyForm());
  Object.keys(touched).forEach((key) => delete touched[key]);
  submitted.value = false;
};
</script>

<template>
  <!-- novalidate: проверку выполняет компонент, сообщения выводятся под полями -->
  <form class="checkout" novalidate @submit.prevent="onSubmit">
    <fieldset class="checkout__group">
      <legend class="checkout__legend">Арендатор</legend>

      <p class="checkout__field">
        <label class="checkout__label" for="fullName">Фамилия и имя *</label>
        <input
          id="fullName"
          v-model.trim="form.fullName"
          class="checkout__input"
          :class="{ checkout__input_error: errorOf('fullName') }"
          type="text"
          autocomplete="name"
          :aria-invalid="Boolean(errorOf('fullName'))"
          aria-describedby="fullName-error"
          @blur="touched.fullName = true"
        >
        <span v-if="errorOf('fullName')" id="fullName-error" class="checkout__error">{{ errorOf("fullName") }}</span>
      </p>

      <p class="checkout__field">
        <label class="checkout__label" for="phone">Телефон *</label>
        <input
          id="phone"
          v-model.trim="form.phone"
          class="checkout__input"
          :class="{ checkout__input_error: errorOf('phone') }"
          type="tel"
          autocomplete="tel"
          placeholder="+7 999 123-45-67"
          :aria-invalid="Boolean(errorOf('phone'))"
          aria-describedby="phone-error"
          @blur="touched.phone = true"
        >
        <span v-if="errorOf('phone')" id="phone-error" class="checkout__error">{{ errorOf("phone") }}</span>
      </p>

      <p class="checkout__field">
        <label class="checkout__label" for="email">Электронная почта</label>
        <input
          id="email"
          v-model.trim="form.email"
          class="checkout__input"
          :class="{ checkout__input_error: errorOf('email') }"
          type="email"
          autocomplete="email"
          :aria-invalid="Boolean(errorOf('email'))"
          aria-describedby="email-error"
          @blur="touched.email = true"
        >
        <span v-if="errorOf('email')" id="email-error" class="checkout__error">{{ errorOf("email") }}</span>
      </p>
    </fieldset>

    <fieldset class="checkout__group">
      <legend class="checkout__legend">Срок договора</legend>
      <div class="checkout__dates">
        <p class="checkout__field">
          <label class="checkout__label" for="startDate">Дата начала *</label>
          <input
            id="startDate"
            v-model="form.startDate"
            class="checkout__input"
            :class="{ checkout__input_error: errorOf('startDate') }"
            type="date"
            :min="today"
            :aria-invalid="Boolean(errorOf('startDate'))"
            aria-describedby="startDate-error"
            @blur="touched.startDate = true"
          >
          <span v-if="errorOf('startDate')" id="startDate-error" class="checkout__error">{{ errorOf("startDate") }}</span>
        </p>
        <p class="checkout__field">
          <label class="checkout__label" for="endDate">Дата окончания *</label>
          <input
            id="endDate"
            v-model="form.endDate"
            class="checkout__input"
            :class="{ checkout__input_error: errorOf('endDate') }"
            type="date"
            :min="form.startDate || today"
            :aria-invalid="Boolean(errorOf('endDate'))"
            aria-describedby="endDate-error"
            @blur="touched.endDate = true"
          >
          <span v-if="errorOf('endDate')" id="endDate-error" class="checkout__error">{{ errorOf("endDate") }}</span>
        </p>
      </div>
      <p v-if="periodDays > 0" class="checkout__hint">Срок договора: {{ formatDays(periodDays) }}.</p>

      <p class="checkout__field">
        <label class="checkout__label" for="people">Участников похода *</label>
        <!-- .number: значение сразу приводится к числу -->
        <input
          id="people"
          v-model.number="form.people"
          class="checkout__input checkout__input_short"
          :class="{ checkout__input_error: errorOf('people') }"
          type="number"
          min="1"
          max="20"
          :aria-invalid="Boolean(errorOf('people'))"
          aria-describedby="people-error"
          @blur="touched.people = true"
        >
        <span v-if="errorOf('people')" id="people-error" class="checkout__error">{{ errorOf("people") }}</span>
      </p>

      <p class="checkout__field">
        <label class="checkout__label" for="pickupPointId">Пункт проката *</label>
        <select
          id="pickupPointId"
          v-model.number="form.pickupPointId"
          class="checkout__input"
          :class="{ checkout__input_error: errorOf('pickupPointId') }"
          :aria-invalid="Boolean(errorOf('pickupPointId'))"
          aria-describedby="pickupPointId-error"
          @blur="touched.pickupPointId = true"
        >
          <option value="">Выберите пункт</option>
          <option v-for="point in pickupPoints" :key="point.id" :value="point.id">
            {{ point.name }}, {{ point.address }}
          </option>
        </select>
        <span v-if="errorOf('pickupPointId')" id="pickupPointId-error" class="checkout__error">{{ errorOf("pickupPointId") }}</span>
      </p>

      <p class="checkout__field">
        <label class="checkout__label" for="comment">Комментарий</label>
        <textarea id="comment" v-model.trim="form.comment" class="checkout__input" rows="3"></textarea>
      </p>

      <p class="checkout__check">
        <input id="agree" v-model="form.agree" class="checkout__checkbox" type="checkbox" aria-describedby="agree-error">
        <label for="agree">Согласен с условиями аренды и ответственностью за повреждение снаряжения *</label>
      </p>
      <span v-if="errorOf('agree')" id="agree-error" class="checkout__error">{{ errorOf("agree") }}</span>
    </fieldset>

    <p v-if="itemsCount === 0" class="checkout__status">
      Добавьте снаряжение в список аренды, чтобы оформить договор.
    </p>
    <p v-else-if="submitted && !isValid" class="checkout__status checkout__status_error" role="alert">
      Исправьте поля, отмеченные красным.
    </p>
    <p v-else class="checkout__status">
      Позиций: {{ itemsCount }}, к оплате при получении {{ formatMoney(total) }}.
    </p>

    <BaseButton type="submit" :disabled="itemsCount === 0">Оформить договор аренды</BaseButton>
  </form>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;
@use "../assets/scss/mixins" as *;

.checkout {
  &__group {
    margin: 0 0 $space-m;
    padding: $space-m;
    border: 1px solid $color-border;
    border-radius: $radius;
  }

  &__legend {
    padding: 0 $space-s;
    font-family: $font-heading;
    font-size: 18px;
    font-weight: bold;
  }

  &__field {
    margin: 0 0 $space-m;
  }

  &__dates {
    display: flex;
    flex-direction: column;

    @include tablet {
      flex-direction: row;
      gap: $space-m;
    }

    .checkout__field {
      flex: 1;
    }
  }

  &__label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
  }

  &__input {
    display: block;
    width: 100%;
    max-width: 500px;
    min-height: 44px;
    padding: $space-s;
    font: inherit;
    border: 1px solid $color-border;
    border-radius: $radius;

    &:hover {
      border-color: $color-primary;
    }

    &_short {
      max-width: 8em;
    }

    &_error {
      border: 2px solid $color-error;
    }
  }

  &__error {
    display: block;
    margin-top: 4px;
    font-size: 14px;
    font-weight: bold;
    color: $color-error;
  }

  &__hint {
    margin: -$space-s 0 $space-m;
    color: $color-primary-dark;
  }

  &__check {
    display: flex;
    align-items: flex-start;
    gap: $space-s;
    margin: 0;
  }

  &__checkbox {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin: 2px 0 0;
    accent-color: $color-primary;
  }

  &__status {
    margin: 0 0 $space-m;
    font-weight: bold;

    &_error {
      color: $color-error;
    }
  }
}
</style>
