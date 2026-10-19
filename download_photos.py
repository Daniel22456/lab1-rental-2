"""Скачивает фотографии снаряжения с Wikimedia Commons (свободные лицензии).

Лабораторная работа №1, вариант 19. Автор: Саяхов Даниэль, ИВТ-ПО-302Б (СДР).

Запуск (нужен интернет):  python3 download_photos.py   (Windows: python download_photos.py)

Фото сохраняются в static/images/, автор и лицензия каждого фото — в
static/images/credits.json (их показывает страница «Источники изображений»).
Если база rental.db уже создана, рисунки в ней заменяются на фотографии.
Пока фото не скачаны, сайт показывает рисунки SVG.
"""
import html
import json
import re
import sqlite3
import ssl
import urllib.parse
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
IMAGES_DIR = BASE_DIR / "static" / "images"
DB_PATH = BASE_DIR / "rental.db"
CREDITS_PATH = IMAGES_DIR / "credits.json"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "PrivalLab1/1.0 (student project; python-urllib)"
WIDTH = 960  # ширина скачиваемой копии, px

# Фото палатки «Ветер-3», рюкзака «Штурм 50», спального мешка, горелки и бутыли
# уже лежат в static/images; скрипт скачивает фото для остальных позиций.
# файл на сайте, рисунок, который он заменяет, файл на Wikimedia Commons, где используется, alt
PHOTOS = [
    ("photo-tent-kupol.jpg", "tent-kupol.svg", "SingleWallDomeTent.jpg",
     "Палатка «Купол-2»", "Лёгкая палатка-купол"),
    ("photo-backpack-tropa.jpg", "backpack-tropa.svg", "Hiker with a large backpack (Unsplash).jpg",
     "Рюкзак «Тропа 70»", "Большой походный рюкзак"),
    ("photo-mat.jpg", "mat.svg", "Self-inflating mat.jpg",
     "Коврик самонадувающийся", "Самонадувающийся туристический коврик"),
    ("photo-poles.jpg", "poles.svg", "Trekking poles.jpg",
     "Трекинговые палки (пара)", "Телескопические трекинговые палки"),
    ("photo-hero.jpg", "hero.svg",
     "Tent camping along the Sulayr trail in La Taha, Sierra Nevada National Park (DSCF5147).jpg",
     "Главная страница", "Туристическая палатка на фоне гор"),
]


def ssl_context():
    """На macOS у Python с python.org бывают не установлены сертификаты — берём их из certifi."""
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


CONTEXT = ssl_context()


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30, context=CONTEXT) as response:
        return response.read()


def clean(value):
    """Убирает HTML-теги из полей описания файла на Commons."""
    return html.unescape(re.sub(r"<[^>]+>", "", str(value))).strip()


def commons_info(title):
    """Адрес уменьшенной копии, автор и лицензия файла по API Wikimedia Commons."""
    params = {"action": "query", "titles": "File:" + title, "prop": "imageinfo",
              "iiprop": "url|extmetadata", "iiurlwidth": WIDTH,
              "format": "json", "formatversion": "2"}
    data = json.loads(fetch(API + "?" + urllib.parse.urlencode(params)))
    page = data["query"]["pages"][0]
    if "imageinfo" not in page:
        raise LookupError(f"файл не найден на Commons: {title}")
    info = page["imageinfo"][0]
    meta = info.get("extmetadata", {})

    def field(name):
        return clean(meta.get(name, {}).get("value", ""))

    return {
        "url": info.get("thumburl") or info["url"],
        "source_url": info["descriptionurl"],
        "author": field("Artist") or "не указан",
        "license": field("LicenseShortName") or "см. страницу файла",
        "license_url": field("LicenseUrl"),
    }


def load_credits():
    try:
        return {c["file"]: c for c in json.loads(CREDITS_PATH.read_text(encoding="utf-8"))}
    except (OSError, ValueError):
        return {}


def update_db(done):
    """Заменяет рисунки на фотографии в уже созданной базе данных."""
    if not DB_PATH.exists():
        return 0
    con = sqlite3.connect(DB_PATH)
    try:
        changed = 0
        for filename, drawing, _title, _label, alt in done:
            cur = con.execute("UPDATE equipment SET image = ?, image_alt = ? WHERE image IN (?, ?)",
                              (filename, alt, drawing, filename))
            changed += cur.rowcount
        con.commit()
        return changed
    finally:
        con.close()


def main():
    credits = load_credits()
    done, failed = [], []
    for photo in PHOTOS:
        filename, _drawing, title, label, _alt = photo
        target = IMAGES_DIR / filename
        try:
            info = commons_info(title)
            if not target.exists():
                data = fetch(info["url"])
                if not data.startswith(b"\xff\xd8"):
                    raise ValueError("получен не JPEG-файл")
                target.write_bytes(data)
            credits[filename] = {"file": filename, "label": label, "title": title,
                                 "author": info["author"], "license": info["license"],
                                 "license_url": info["license_url"], "source_url": info["source_url"]}
            done.append(photo)
            print(f"готово: {filename} — {info['author']}, {info['license']}")
        except (OSError, ValueError, LookupError, KeyError) as error:
            failed.append(filename)
            print(f"не удалось: {filename} ({error})")
            if "CERTIFICATE_VERIFY_FAILED" in str(error):
                print("  установите сертификаты: pip3 install certifi — и запустите скрипт ещё раз")

    CREDITS_PATH.write_text(json.dumps(list(credits.values()), ensure_ascii=False, indent=2),
                            encoding="utf-8")
    changed = update_db(done)
    print(f"\nСкачано фото: {len(done)} из {len(PHOTOS)}. Обновлено записей в базе: {changed}.")
    if failed:
        print("Для неудавшихся файлов сайт покажет рисунки. Можно запустить скрипт ещё раз.")


if __name__ == "__main__":
    main()
