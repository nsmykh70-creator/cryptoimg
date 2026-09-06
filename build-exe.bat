@echo off
chcp 65001 > nul
title Cryptoimg Desktop - Windows EXE & Installer Builder
color 0A

echo ========================================================
echo         Cryptoimg Desktop v5.1 - Windows Build
echo ========================================================
echo.

:: 1. Проверка наличия Node.js
echo [1/4] Проверка окружения Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] Node.js не найден в системе!
    echo Установите Node.js с https://nodejs.org и перезапустите.
    echo.
    pause
    exit /b 1
)

:: 2. Установка зависимостей
echo [2/4] Проверка и установка зависимостей npm...
if not exist "node_modules\" (
    echo Устанавливаем необходимые пакеты (npm install)...
    call npm install
) else (
    echo Зависимости найдены.
)

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] npm install завершился с ошибкой.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Сборка Vite
echo.
echo [3/4] Компиляция веб-интерфейса (Vite)...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] Vite build завершился с ошибкой.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Сборка пакетов Windows
echo.
echo [4/4] Сборка Windows пакетов (Инсталлятор + Portable)...
call npx electron-builder --win --config electron-builder.json
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] electron-builder завершился с ошибкой.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo  СБОРКА УСПЕШНО ЗАВЕРШЕНА!
echo  Готовые файлы в папке "release\":
echo    - release\Cryptoimg-Portable-v5.1.0.exe (Портативная версия)
echo    - release\Cryptoimg-5.1.0-x64.exe (Установщик NSIS)
echo ========================================================
echo.

if exist "release\" (
    explorer release
)

pause
