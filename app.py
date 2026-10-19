"""Прокат туристического снаряжения «Привал» — учебный веб-сервис.

Лабораторная работа №1 «Основы HTML», вариант 19.
Автор: Саяхов Даниэль, группа ИВТ-ПО-302Б (СДР).

Страницы — HTML-шаблоны без CSS и JavaScript.
Данные хранятся в базе SQLite (файл rental.db), сервер — Flask.

Запуск:   python app.py
Сброс БД: python app.py --reset
"""
import json
import re
import sqlite3
import sys
import uuid
from datetime import date
from pathlib import Path

from flask import (Flask, abort, flash, g, redirect, render_template,
                   request, url_for)
from markupsafe import Markup

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "rental.db"
IMAGES_DIR = BASE_DIR / "static" / "images"
IMAGE_TYPES = {".svg", ".png", ".jpg", ".jpeg", ".webp"}
UPLOAD_TYPES = {".png", ".jpg", ".jpeg", ".webp"}   # SVG не принимаем: он может содержать скрипты
SITE_IMAGES = {"logo.svg", "hero.svg", "photo-hero.jpg"}  # служебные картинки сайта
CREDITS_PATH = IMAGES_DIR / "credits.json"          # авторы и лицензии фото (download_photos.py)
MAX_DAYS = 30

# Водяной знак автора в заголовках страниц
AUTHOR = "Саяхов Даниэль, ИВТ-ПО-302Б"
WATERMARK = Markup(f'<abbr title="{AUTHOR}">СДР</abbr>')

app = Flask(__name__)
app.config["SECRET_KEY"] = "privat-lab1-sdr"        # нужен для flash-сообщений
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # загрузка изображений до 2 МБ

NAV = [
    ("index", "Главная"),
    ("catalog", "Каталог"),
    ("collection", "Список аренды"),
    ("checkout", "Оформление договора"),
    ("admin", "Управление"),
]


# ---------------------------------------------------------------- база данных

def init_db(reset=False):
    """Создаёт базу из schema.sql и seed.sql, если её ещё нет."""
    if reset and DB_PATH.exists():
        DB_PATH.unlink()
    if DB_PATH.exists():
        return
    con = sqlite3.connect(DB_PATH)
    try:
        con.executescript((BASE_DIR / "schema.sql").read_text(encoding="utf-8"))
        con.executescript((BASE_DIR / "seed.sql").read_text(encoding="utf-8"))
        con.commit()
    finally:
        con.close()


def get_db():
    """Одно подключение к базе на запрос."""
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def query(sql, params=(), one=False):
    rows = get_db().execute(sql, params).fetchall()
    if one:
        return rows[0] if rows else None
    return rows


def placeholders(values):
    return ",".join("?" * len(values))


def rental_rows():
    return query("""
        SELECT r.id, r.days, e.id AS equipment_id, e.name, e.price_per_day,
               e.deposit, c.name AS category, r.days * e.price_per_day AS cost
        FROM rental_item r
        JOIN equipment e ON e.id = r.equipment_id
        JOIN category c ON c.id = e.category_id
        ORDER BY c.id, e.id""")


def rental_summary(rows):
    return {
        "count": len(rows),
        "rent": sum(r["cost"] for r in rows),
        "deposit": sum(r["deposit"] for r in rows),
    }


def group_by_category(rows):
    """Группирует строки по категории (для rowspan и разделов каталога)."""
    groups = []
    for row in rows:
        if not groups or groups[-1]["name"] != row["category"]:
            groups.append({"name": row["category"], "rows": []})
        groups[-1]["rows"].append(row)
    return groups


def parse_specs(text):
    specs = []
    for line in text.splitlines():
        if ":" in line:
            key, value = (part.strip() for part in line.split(":", 1))
            if key and value:
                specs.append((key, value))
    return specs


def site_images():
    return sorted(p.name for p in IMAGES_DIR.iterdir()
                  if p.suffix.lower() in IMAGE_TYPES and p.name not in SITE_IMAGES)


def adult_limit(today):
    """Последняя дата рождения, при которой арендатору уже исполнилось 18 лет."""
    try:
        return today.replace(year=today.year - 18)
    except ValueError:  # 29 февраля
        return today.replace(year=today.year - 18, day=28)


# ------------------------------------------------------------ шаблоны

@app.context_processor
def inject_common():
    count = query("SELECT COUNT(*) AS n FROM rental_item", one=True)["n"]
    return {"nav": NAV, "rental_count": count, "wm": WATERMARK, "author": AUTHOR}


@app.template_filter("money")
def money(value):
    return f"{int(value):,}".replace(",", " ")


@app.template_filter("plural")
def plural(n, one, few, many):
    n = abs(int(n))
    if n % 10 == 1 and n % 100 != 11:
        return one
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return few
    return many


@app.template_filter("first_sentence")
def first_sentence(text):
    match = re.match(r"(.+?[.!?])(\s|$)", text.strip(), re.S)
    return match.group(1) if match else text


@app.template_filter("date_ru")
def date_ru(value):
    return date.fromisoformat(value[:10]).strftime("%d.%m.%Y")


@app.template_filter("image_src")
def image_src(name):
    """Адрес изображения; если фото ещё не скачано — рисунок SVG с тем же именем."""
    if not (IMAGES_DIR / name).is_file():
        drawing = Path(name).stem.removeprefix("photo-") + ".svg"
        name = drawing if (IMAGES_DIR / drawing).is_file() else "placeholder.svg"
    return url_for("static", filename="images/" + name)


# ------------------------------------------------------------ страницы сайта

@app.route("/")
@app.route("/index.html")
def index():
    stats = query("""SELECT COUNT(*) AS items, COUNT(DISTINCT category_id) AS categories
                     FROM equipment""", one=True)
    featured = query("""
        SELECT e.id, e.name, e.price_per_day, e.deposit, c.name AS category
        FROM equipment e JOIN category c ON c.id = e.category_id
        WHERE e.id IN (SELECT MIN(id) FROM equipment GROUP BY category_id)
        ORDER BY c.id""")
    return render_template("index.html", stats=stats, featured=featured, hero="photo-hero.jpg")


@app.route("/catalog.html")
def catalog():
    categories = query("SELECT id, name FROM category ORDER BY id")
    selected = request.args.get("category", type=int)
    sql = """SELECT e.*, c.name AS category
             FROM equipment e JOIN category c ON c.id = e.category_id"""
    params = ()
    if selected:
        sql += " WHERE c.id = ?"
        params = (selected,)
    sql += " ORDER BY c.id, e.id"
    groups = group_by_category(query(sql, params))
    in_list = {r["equipment_id"] for r in query("SELECT equipment_id FROM rental_item")}
    return render_template("catalog.html", categories=categories, selected=selected,
                           groups=groups, in_list=in_list)


@app.route("/detail.html")
def detail():
    item_id = request.args.get("id", type=int)
    item = query("""SELECT e.*, c.name AS category FROM equipment e
                    JOIN category c ON c.id = e.category_id WHERE e.id = ?""",
                 (item_id,), one=True)
    if item is None:
        abort(404)
    related = query("""SELECT id, name, price_per_day FROM equipment
                       WHERE category_id = ? AND id <> ? ORDER BY id""",
                    (item["category_id"], item["id"]))
    in_list = query("SELECT days FROM rental_item WHERE equipment_id = ?",
                    (item["id"],), one=True)
    return render_template("detail.html", item=item, specs=parse_specs(item["specs"]),
                           paragraphs=[p for p in item["description"].splitlines() if p.strip()],
                           related=related, in_list=in_list)


@app.route("/collection.html")
def collection():
    rows = rental_rows()
    return render_template("collection.html", groups=group_by_category(rows),
                           summary=rental_summary(rows))


@app.post("/collection/add")
def collection_add():
    ids = request.form.getlist("equipment_id", type=int)
    days = request.form.get("days", type=int)
    if not ids:
        flash("Не выбрано ни одной позиции: отметьте снаряжение в каталоге.")
        return redirect(url_for("catalog"))
    if days is None or not 1 <= days <= MAX_DAYS:
        flash(f"Срок аренды должен быть от 1 до {MAX_DAYS} дней.")
        return redirect(url_for("catalog"))
    db = get_db()
    existing = {r["id"] for r in query(
        f"SELECT id FROM equipment WHERE id IN ({placeholders(ids)})", ids)}
    for equipment_id in existing:
        db.execute("""INSERT INTO rental_item (equipment_id, days) VALUES (?, ?)
                      ON CONFLICT (equipment_id) DO UPDATE SET days = excluded.days""",
                   (equipment_id, days))
    db.commit()
    flash(f"В список аренды добавлено позиций: {len(existing)} (срок — {days} дн.).")
    return redirect(url_for("collection"))


@app.post("/collection/update")
def collection_update():
    action = request.form.get("action")
    db = get_db()
    if action == "clear":
        db.execute("DELETE FROM rental_item")
        db.commit()
        flash("Список аренды очищен.")
        return redirect(url_for("collection"))

    ids = request.form.getlist("item_id", type=int)
    if not ids:
        flash("Отметьте в таблице хотя бы одну позицию.")
        return redirect(url_for("collection"))

    if action == "remove":
        cur = db.execute(f"DELETE FROM rental_item WHERE id IN ({placeholders(ids)})", ids)
        flash(f"Убрано из списка позиций: {cur.rowcount}.")
    elif action == "set_days":
        days = request.form.get("days", type=int)
        if days is None or not 1 <= days <= MAX_DAYS:
            flash(f"Срок аренды должен быть от 1 до {MAX_DAYS} дней.")
            return redirect(url_for("collection"))
        cur = db.execute(f"UPDATE rental_item SET days = ? WHERE id IN ({placeholders(ids)})",
                         [days, *ids])
        flash(f"Срок аренды изменён на {days} дн. для позиций: {cur.rowcount}.")
    else:
        abort(400)
    db.commit()
    return redirect(url_for("collection"))


# ------------------------------------------------------------ договор аренды

CONTRACT_FIELDS = [
    "last_name", "first_name", "middle_name", "birth_date", "phone", "email",
    "passport_series", "passport_number", "passport_date", "passport_issuer",
    "passport_code", "address", "start_date", "end_date", "people",
    "pickup_method", "pickup_point_id", "pickup_time", "comment",
]
NAME_RE = r"[А-Яа-яЁё]+(-[А-Яа-яЁё]+)?"
DATE_LABELS = {
    "birth_date": "Дата рождения",
    "passport_date": "Дата выдачи паспорта",
    "start_date": "Дата начала похода",
    "end_date": "Дата окончания похода",
}


def validate_contract(form, today):
    """Серверная проверка формы (дублирует HTML5-валидацию браузера)."""
    data = {key: (form.get(key) or "").strip() for key in CONTRACT_FIELDS}
    errors = []

    def need(key, label, pattern=None, message=None):
        value = data[key]
        if not value:
            errors.append(f"Не заполнено поле «{label}».")
        elif pattern and not re.fullmatch(pattern, value):
            errors.append(message or f"Поле «{label}» заполнено неверно.")

    name_msg = "должно содержать только русские буквы (допускается дефис)."
    need("last_name", "Фамилия", NAME_RE, "Поле «Фамилия» " + name_msg)
    need("first_name", "Имя", NAME_RE, "Поле «Имя» " + name_msg)
    if data["middle_name"] and not re.fullmatch(NAME_RE, data["middle_name"]):
        errors.append("Поле «Отчество» " + name_msg)
    need("phone", "Телефон", r"\+7[0-9]{10}", "Телефон укажите в формате +7XXXXXXXXXX.")
    need("email", "Электронная почта", r"[^@\s]+@[^@\s]+\.[^@\s]+",
         "Укажите корректный адрес электронной почты.")
    need("passport_series", "Серия паспорта", r"[0-9]{4}", "Серия паспорта — 4 цифры.")
    need("passport_number", "Номер паспорта", r"[0-9]{6}", "Номер паспорта — 6 цифр.")
    need("passport_issuer", "Кем выдан")
    need("passport_code", "Код подразделения", r"[0-9]{3}-[0-9]{3}",
         "Код подразделения укажите в формате 000-000.")
    need("address", "Адрес регистрации")
    need("people", "Количество участников похода", r"[0-9]{1,2}")
    need("pickup_time", "Время получения", r"[0-9]{2}:[0-9]{2}")

    dates = {}
    for key, label in DATE_LABELS.items():
        if not data[key]:
            errors.append(f"Не заполнено поле «{label}».")
            continue
        try:
            dates[key] = date.fromisoformat(data[key])
        except ValueError:
            errors.append(f"Поле «{label}» содержит неверную дату.")
    if "birth_date" in dates and dates["birth_date"] > adult_limit(today):
        errors.append("Договор аренды заключается только с совершеннолетним арендатором.")
    if "passport_date" in dates and dates["passport_date"] > today:
        errors.append("Дата выдачи паспорта не может быть позже сегодняшней.")
    if "start_date" in dates and dates["start_date"] < today:
        errors.append("Дата начала похода не может быть в прошлом.")
    if "start_date" in dates and "end_date" in dates and dates["end_date"] < dates["start_date"]:
        errors.append("Дата окончания похода не может быть раньше даты начала.")

    if data["people"].isdigit() and not 1 <= int(data["people"]) <= 30:
        errors.append("Количество участников похода — от 1 до 30.")
    if data["pickup_time"] and not "09:00" <= data["pickup_time"] <= "20:00":
        errors.append("Время получения — с 09:00 до 20:00.")
    if data["pickup_method"] not in ("pickup", "delivery"):
        errors.append("Выберите способ получения снаряжения.")
    if not data["pickup_point_id"].isdigit() or query(
            "SELECT 1 FROM pickup_point WHERE id = ?", (data["pickup_point_id"],), one=True) is None:
        errors.append("Выберите пункт проката.")
    if len(data["comment"]) > 500:
        errors.append("Комментарий — не более 500 символов.")
    if form.get("agree_damage") != "yes":
        errors.append("Необходимо согласие с условиями возмещения ущерба при порче или утрате снаряжения.")
    if form.get("agree_pd") != "yes":
        errors.append("Необходимо согласие на обработку персональных данных.")
    return data, errors


@app.route("/checkout.html", methods=["GET", "POST"])
def checkout():
    today = date.today()
    rows = rental_rows()
    summary = rental_summary(rows)
    points = query("SELECT id, name, address, hours FROM pickup_point ORDER BY id")
    errors = []
    if request.method == "POST":
        data, errors = validate_contract(request.form, today)
        if not rows:
            errors.append("Список аренды пуст: добавьте снаряжение из каталога.")
        if not errors:
            db = get_db()
            values = [data[key] for key in CONTRACT_FIELDS]
            cur = db.execute(
                f"INSERT INTO contract ({', '.join(CONTRACT_FIELDS)}, total_rent, total_deposit) "
                f"VALUES ({placeholders(CONTRACT_FIELDS)}, ?, ?)",
                [*values, summary["rent"], summary["deposit"]])
            contract_id = cur.lastrowid
            db.executemany(
                """INSERT INTO contract_item (contract_id, equipment_name, days, price_per_day, deposit)
                   VALUES (?, ?, ?, ?, ?)""",
                [(contract_id, r["name"], r["days"], r["price_per_day"], r["deposit"]) for r in rows])
            db.execute("DELETE FROM rental_item")
            db.commit()
            flash(f"Договор аренды № {contract_id} оформлен и сохранён в базе данных.")
            return redirect(url_for("contract", id=contract_id))
    else:
        data = {key: "" for key in CONTRACT_FIELDS}
        data.update(people="1", pickup_method="pickup")
    return render_template("checkout.html", data=data, errors=errors, summary=summary,
                           points=points, today=today.isoformat(),
                           adult=adult_limit(today).isoformat())


@app.route("/contract.html")
def contract():
    contract_id = request.args.get("id", type=int)
    c = query("""SELECT c.*, p.name AS point_name, p.address AS point_address
                 FROM contract c JOIN pickup_point p ON p.id = c.pickup_point_id
                 WHERE c.id = ?""", (contract_id,), one=True)
    if c is None:
        abort(404)
    items = query("SELECT * FROM contract_item WHERE contract_id = ? ORDER BY id", (contract_id,))
    return render_template("contract.html", c=c, items=items)


@app.route("/credits.html")
def credits():
    try:
        items = json.loads(CREDITS_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        items = []
    return render_template("credits.html", credits=items)


# ------------------------------------------------------------ управление базой

@app.route("/admin.html")
def admin():
    items = query("""SELECT e.id, e.name, e.price_per_day, e.deposit, c.name AS category
                     FROM equipment e JOIN category c ON c.id = e.category_id
                     ORDER BY c.id, e.id""")
    categories = query("""SELECT c.id, c.name, COUNT(e.id) AS n
                          FROM category c LEFT JOIN equipment e ON e.category_id = c.id
                          GROUP BY c.id ORDER BY c.id""")
    contracts = query("""SELECT id, created_at, last_name, first_name, start_date, end_date,
                                total_rent, total_deposit
                         FROM contract ORDER BY id DESC""")
    return render_template("admin.html", items=items, categories=categories, contracts=contracts)


@app.post("/admin/delete")
def admin_delete():
    ids = request.form.getlist("equipment_id", type=int)
    if not ids:
        flash("Отметьте в таблице записи, которые нужно удалить.")
        return redirect(url_for("admin"))
    db = get_db()
    cur = db.execute(f"DELETE FROM equipment WHERE id IN ({placeholders(ids)})", ids)
    db.commit()
    flash(f"Удалено записей из базы: {cur.rowcount}.")
    return redirect(url_for("admin"))


@app.post("/admin/category")
def admin_category():
    name = (request.form.get("name") or "").strip()
    if not 3 <= len(name) <= 50:
        flash("Название категории — от 3 до 50 символов.")
        return redirect(url_for("admin"))
    db = get_db()
    try:
        db.execute("INSERT INTO category (name) VALUES (?)", (name,))
        db.commit()
        flash(f"Категория «{name}» добавлена.")
    except sqlite3.IntegrityError:
        flash(f"Категория «{name}» уже есть в базе.")
    return redirect(url_for("admin"))


@app.post("/admin/category/delete")
def admin_category_delete():
    category_id = request.form.get("category_id", type=int)
    db = get_db()
    try:
        cur = db.execute("DELETE FROM category WHERE id = ?", (category_id,))
        db.commit()
        flash("Категория удалена." if cur.rowcount else "Категория не найдена.")
    except sqlite3.IntegrityError:
        flash("В категории есть снаряжение: сначала удалите или перенесите его.")
    return redirect(url_for("admin"))


EQUIPMENT_FIELDS = ["name", "category_id", "price_per_day", "deposit",
                    "description", "specs", "image", "image_alt"]


@app.route("/admin/edit.html", methods=["GET", "POST"])
def admin_edit():
    item_id = request.args.get("id", type=int)
    item = None
    if item_id is not None:
        item = query("SELECT * FROM equipment WHERE id = ?", (item_id,), one=True)
        if item is None:
            abort(404)
    categories = query("SELECT id, name FROM category ORDER BY id")
    images = site_images()
    errors = []

    if request.method == "POST":
        data = {key: (request.form.get(key) or "").strip() for key in EQUIPMENT_FIELDS}
        upload = request.files.get("image_file")
        has_upload = bool(upload and upload.filename)
        ext = Path(upload.filename).suffix.lower() if has_upload else ""

        if not 3 <= len(data["name"]) <= 100:
            errors.append("Наименование — от 3 до 100 символов.")
        if not any(str(c["id"]) == data["category_id"] for c in categories):
            errors.append("Выберите категорию из списка.")
        if not data["price_per_day"].isdigit() or not 1 <= int(data["price_per_day"]) <= 100000:
            errors.append("Цена аренды за сутки — целое число от 1 до 100 000.")
        if not data["deposit"].isdigit() or int(data["deposit"]) > 1000000:
            errors.append("Залоговая стоимость — целое число от 0 до 1 000 000.")
        if len(data["description"]) < 20:
            errors.append("Описание — не менее 20 символов.")
        if len(data["image_alt"]) < 10:
            errors.append("Альтернативный текст изображения — не менее 10 символов.")
        if has_upload and ext not in UPLOAD_TYPES:
            errors.append("Загружать можно только изображения PNG, JPG или WEBP.")
        if not has_upload and data["image"] not in images:
            errors.append("Выберите изображение из списка или загрузите новое.")

        if not errors:
            if has_upload:
                data["image"] = f"upload-{uuid.uuid4().hex[:8]}{ext}"
                upload.save(IMAGES_DIR / data["image"])
            values = [data[key] for key in EQUIPMENT_FIELDS]
            db = get_db()
            if item:
                assignments = ", ".join(f"{key} = ?" for key in EQUIPMENT_FIELDS)
                db.execute(f"UPDATE equipment SET {assignments} WHERE id = ?", [*values, item["id"]])
                flash(f"Запись «{data['name']}» изменена.")
            else:
                db.execute(f"INSERT INTO equipment ({', '.join(EQUIPMENT_FIELDS)}) "
                           f"VALUES ({placeholders(EQUIPMENT_FIELDS)})", values)
                flash(f"Запись «{data['name']}» добавлена в каталог.")
            db.commit()
            return redirect(url_for("admin"))
    elif item:
        data = {key: str(item[key]) for key in EQUIPMENT_FIELDS}
    else:
        data = {key: "" for key in EQUIPMENT_FIELDS}
        data["image"] = "placeholder.svg"

    return render_template("admin_edit.html", item=item, data=data, categories=categories,
                           images=images, errors=errors)


# ------------------------------------------------------------ ошибки

@app.errorhandler(404)
def not_found(error):
    return render_template("error.html", title="Страница не найдена",
                           message="Такой страницы или записи нет в базе данных."), 404


@app.errorhandler(413)
def too_large(error):
    return render_template("error.html", title="Файл слишком большой",
                           message="Размер загружаемого изображения — не более 2 МБ."), 413


init_db()

if __name__ == "__main__":
    if "--reset" in sys.argv:
        init_db(reset=True)
        print("База данных пересоздана с начальными данными.")
    app.run(debug=True)
