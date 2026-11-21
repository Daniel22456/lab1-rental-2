#!/bin/bash
# Запуск проекта «Привал» на macOS (ЛР6, СДР): двойной клик по этому файлу.
# Запускает мок-сервер json-server (порт 3000) и сервер разработки Vite (порт 5173),
# затем открывает сайт в браузере. Остановка: Ctrl+C или закрыть окно Терминала.

cd "$(dirname "$0")" || exit 1

# В Терминале, открытом двойным кликом, может не быть пути к Node.js из Homebrew
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js не найден. Установите его с сайта https://nodejs.org (версия LTS) и запустите файл снова."
  read -r -p "Нажмите Enter, чтобы закрыть окно…"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Первый запуск: устанавливаю зависимости (npm install)…"
  npm install || { read -r -p "Ошибка установки. Нажмите Enter…"; exit 1; }
fi

echo "Запускаю мок-сервер json-server: http://localhost:3000"
npm run server &
SERVER_PID=$!

# При закрытии окна или Ctrl+C останавливаем и мок-сервер
trap 'kill $SERVER_PID 2>/dev/null' EXIT INT TERM

sleep 2
echo "Запускаю сайт: http://localhost:5173"
npm run dev -- --open
