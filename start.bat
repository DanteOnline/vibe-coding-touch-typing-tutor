@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  Touch Typing Tutor - запуск проекта
echo  ===================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [Ошибка] Node.js не найден. Установите: https://nodejs.org/
  goto :finish
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [Ошибка] npm не найден. Переустановите Node.js.
  goto :finish
)

if not exist ".env" (
  if exist ".env.example" (
    echo [1/4] Создаю .env из .env.example...
    copy /Y ".env.example" ".env" >nul
  ) else (
    echo [Ошибка] Не найден .env.example
    goto :finish
  )
) else (
  echo [1/4] .env найден
)

if not exist "node_modules\" (
  echo [2/4] Устанавливаю зависимости...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install не удался. Пробую обход для Windows/OneDrive...
    call npm install --ignore-scripts
    if errorlevel 1 goto :finish
    call npx prisma generate
    if errorlevel 1 goto :finish
  )
) else (
  echo [2/4] Зависимости уже установлены
)

echo [3/4] Применяю миграции базы данных...
call npx prisma migrate deploy
if errorlevel 1 (
  echo migrate deploy не удался, пробую prisma migrate dev...
  call npx prisma migrate dev
  if errorlevel 1 goto :finish
)

echo [4/4] Запускаю dev-сервер...
echo.
echo  Приложение: http://localhost:3000
echo  Админка:     http://localhost:3000/admin
echo  Остановка:   Ctrl+C
echo.

call npm run dev

:finish
echo.
pause
