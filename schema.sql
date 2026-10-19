-- Схема базы данных проката туристического снаряжения «Привал» (СДР)
PRAGMA foreign_keys = ON;

-- Категории снаряжения
CREATE TABLE category (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL UNIQUE
);

-- Снаряжение (каталог)
CREATE TABLE equipment (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id   INTEGER NOT NULL REFERENCES category (id) ON DELETE RESTRICT,
    name          TEXT    NOT NULL,
    description   TEXT    NOT NULL,
    specs         TEXT    NOT NULL DEFAULT '',                -- строки вида «Название: значение»
    price_per_day INTEGER NOT NULL CHECK (price_per_day > 0), -- цена аренды за сутки, руб.
    deposit       INTEGER NOT NULL CHECK (deposit >= 0),      -- залоговая стоимость, руб.
    image         TEXT    NOT NULL DEFAULT 'placeholder.svg',
    image_alt     TEXT    NOT NULL
);

-- Список аренды (позиции, выбранные пользователем)
CREATE TABLE rental_item (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER NOT NULL UNIQUE REFERENCES equipment (id) ON DELETE CASCADE,
    days         INTEGER NOT NULL CHECK (days BETWEEN 1 AND 30)
);

-- Пункты проката
CREATE TABLE pickup_point (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    address TEXT NOT NULL,
    hours   TEXT NOT NULL
);

-- Договоры аренды
CREATE TABLE contract (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    last_name       TEXT    NOT NULL,
    first_name      TEXT    NOT NULL,
    middle_name     TEXT    NOT NULL DEFAULT '',
    birth_date      TEXT    NOT NULL,
    phone           TEXT    NOT NULL,
    email           TEXT    NOT NULL,
    passport_series TEXT    NOT NULL,
    passport_number TEXT    NOT NULL,
    passport_date   TEXT    NOT NULL,
    passport_issuer TEXT    NOT NULL,
    passport_code   TEXT    NOT NULL,
    address         TEXT    NOT NULL,
    start_date      TEXT    NOT NULL,
    end_date        TEXT    NOT NULL,
    people          INTEGER NOT NULL CHECK (people BETWEEN 1 AND 30),
    pickup_method   TEXT    NOT NULL CHECK (pickup_method IN ('pickup', 'delivery')),
    pickup_point_id INTEGER NOT NULL REFERENCES pickup_point (id),
    pickup_time     TEXT    NOT NULL,
    comment         TEXT    NOT NULL DEFAULT '',
    total_rent      INTEGER NOT NULL,
    total_deposit   INTEGER NOT NULL
);

-- Позиции договора (копия данных на момент оформления)
CREATE TABLE contract_item (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id    INTEGER NOT NULL REFERENCES contract (id) ON DELETE CASCADE,
    equipment_name TEXT    NOT NULL,
    days           INTEGER NOT NULL,
    price_per_day  INTEGER NOT NULL,
    deposit        INTEGER NOT NULL
);
