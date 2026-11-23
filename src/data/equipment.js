// Вариант 19: исходные данные — 15 позиций снаряжения (из db.json ЛР6)
// Названия полей совпадают с входными параметрами компонента EquipmentCard.vue

export const equipment = [
  {
    id: 1,
    title: "Палатка «Ветер-3»",
    category: "Палатки",
    dailyRate: 450,
    depositAmount: 8000,
    weightKg: 6.5,
    inStock: true,
    imageUrl: "/images/photo-tent-veter.jpg",
    imageAlt: "Светлая кемпинговая палатка с окнами и трубой печи на берегу горного озера",
    features: [
      "3 человека",
      "выход для трубы печи"
    ]
  },
  {
    id: 2,
    title: "Палатка «Купол-2»",
    category: "Палатки",
    dailyRate: 350,
    depositAmount: 6000,
    weightKg: 2.6,
    inStock: false,
    imageUrl: "/images/tent-kupol.svg",
    imageAlt: "Лёгкая палатка-купол",
    features: [
      "2 человека",
      "лето"
    ]
  },
  {
    id: 3,
    title: "Рюкзак «Тропа 70»",
    category: "Рюкзаки",
    dailyRate: 200,
    depositAmount: 5000,
    weightKg: 2.1,
    inStock: true,
    imageUrl: "/images/backpack-tropa.svg",
    imageAlt: "Большой походный рюкзак",
    features: [
      "70 л",
      "накидка от дождя"
    ]
  },
  {
    id: 4,
    title: "Рюкзак «Штурм 50»",
    category: "Рюкзаки",
    dailyRate: 150,
    depositAmount: 3500,
    weightKg: 1.8,
    inStock: true,
    imageUrl: "/images/photo-backpack-shturm.jpg",
    imageAlt: "Чёрный тактический рюкзак на 50 литров",
    features: [
      "50 л",
      "стропы MOLLE"
    ]
  },
  {
    id: 5,
    title: "Спальный мешок «Зима −20»",
    category: "Спальные принадлежности",
    dailyRate: 180,
    depositAmount: 4000,
    weightKg: 2.4,
    inStock: true,
    imageUrl: "/images/photo-sleeping-bag.jpg",
    imageAlt: "Тёмно-зелёный спальный мешок-одеяло у костра в лесу",
    features: [
      "до −20 °C",
      "флис"
    ]
  },
  {
    id: 6,
    title: "Коврик самонадувающийся",
    category: "Спальные принадлежности",
    dailyRate: 80,
    depositAmount: 1500,
    weightKg: 0.9,
    inStock: true,
    imageUrl: "/images/mat.svg",
    imageAlt: "Самонадувающийся туристический коврик",
    features: [
      "толщина 5 см",
      "183 × 51 см"
    ]
  },
  {
    id: 7,
    title: "Газовая горелка с котелком",
    category: "Туристическое оборудование",
    dailyRate: 120,
    depositAmount: 2500,
    weightKg: 0.6,
    inStock: true,
    imageUrl: "/images/photo-burner.jpg",
    imageAlt: "Газовая горелка с котелком в термочехле на газовом баллоне",
    features: [
      "котелок 1 л",
      "пьезоподжиг"
    ]
  },
  {
    id: 8,
    title: "Трекинговые палки (пара)",
    category: "Туристическое оборудование",
    dailyRate: 100,
    depositAmount: 2000,
    weightKg: 0.5,
    inStock: true,
    imageUrl: "/images/poles.svg",
    imageAlt: "Телескопические трекинговые палки",
    features: [
      "телескопические",
      "алюминий"
    ]
  },
  {
    id: 9,
    title: "Вода, бутыль 3 л",
    category: "Туристическое оборудование",
    dailyRate: 30,
    depositAmount: 500,
    weightKg: 1.2,
    inStock: false,
    imageUrl: "/images/photo-water.jpg",
    imageAlt: "Стеклянная бутыль объёмом 3 литра с чёрной этикеткой",
    features: [
      "3 л",
      "стекло"
    ]
  },
  {
    id: 10,
    title: "Палатка «Шторм-4»",
    category: "Палатки",
    dailyRate: 600,
    depositAmount: 10000,
    weightKg: 5.8,
    inStock: true,
    imageUrl: "/images/tent-shtorm.svg",
    imageAlt: "Зелёная четырёхместная палатка-купол на траве",
    features: [
      "4 человека",
      "2 входа"
    ]
  },
  {
    id: 11,
    title: "Палатка «Бивак-1»",
    category: "Палатки",
    dailyRate: 250,
    depositAmount: 4000,
    weightKg: 1.4,
    inStock: true,
    imageUrl: "/images/tent-bivak.svg",
    imageAlt: "Жёлтая одноместная палатка на траве",
    features: [
      "1 человек",
      "лето"
    ]
  },
  {
    id: 12,
    title: "Рюкзак «Атака 30»",
    category: "Рюкзаки",
    dailyRate: 120,
    depositAmount: 2500,
    weightKg: 0.9,
    inStock: true,
    imageUrl: "/images/backpack-ataka.svg",
    imageAlt: "Красный рюкзак на 30 литров",
    features: [
      "30 л",
      "жёсткая спинка"
    ]
  },
  {
    id: 13,
    title: "Спальный мешок «Лето +10»",
    category: "Спальные принадлежности",
    dailyRate: 100,
    depositAmount: 2000,
    weightKg: 0.8,
    inStock: true,
    imageUrl: "/images/sleeping-bag-leto.svg",
    imageAlt: "Оранжевый спальный мешок-кокон на траве",
    features: [
      "комфорт +10 °C",
      "кокон"
    ]
  },
  {
    id: 14,
    title: "Налобный фонарь",
    category: "Туристическое оборудование",
    dailyRate: 60,
    depositAmount: 1000,
    weightKg: 0.1,
    inStock: true,
    imageUrl: "/images/headlamp.svg",
    imageAlt: "Налобный фонарь с оранжевым корпусом и лучом света",
    features: [
      "350 лм",
      "до 40 ч"
    ]
  },
  {
    id: 15,
    title: "Котелок туристический 2 л",
    category: "Туристическое оборудование",
    dailyRate: 50,
    depositAmount: 800,
    weightKg: 0.5,
    inStock: true,
    imageUrl: "/images/kettle.svg",
    imageAlt: "Металлический котелок с дужкой над огнём",
    features: [
      "2 л",
      "нержавеющая сталь"
    ]
  }
];
