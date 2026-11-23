#!/bin/bash
# Запуск проекта «Привал» на macOS (ЛР7, Vue 3, СДР): двойной клик по этому файлу.
# Запускает сервер разработки Vite (порт 5173) и открывает сайт в браузере.
# Остановка: Ctrl+C или закрыть окно Терминала.

cd "$(dirname "$0")" || exit 1

# В Терминале, открытом двойным кликом, может не быть пути к Node.js из Homebrew
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js не найден. Установите его с сайта https://nodejs.org (версия LTS) и запустите файл снова."
  read -r -p "Нажмите Enter, чтобы закрыть окно…"
  exit 1
fi

# Зависимости ставятся при первом запуске и после смены набора пакетов (переход с ЛР6 на ЛР7)
if [ ! -d node_modules/vue ]; then
  echo "Устанавливаю зависимости (npm install)…"
  npm install || { read -r -p "Ошибка установки. Нажмите Enter…"; exit 1; }
fi

echo "Запускаю сайт: http://localhost:5173 (Vue DevTools: Alt+Shift+D)"
npm run dev -- --open
