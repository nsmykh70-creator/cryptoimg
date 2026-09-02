@echo off
chcp 65001 > nul
title Cryptoimg Desktop - Portable EXE Builder
color 0B

echo ========================================================
echo     Cryptoimg Desktop v5.1 - Standalone PORTABLE Build
echo ========================================================
echo.

:: 1. Проверка наличия Node.js и npm
echo [1/4] Проверка окружения Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] Node.js не найден в системе!
    echo Пожалуйста, установите Node.js с официального сайта: https://nodejs.org
    echo После установки перезапустите этот файл.
    echo.
    pause
    exit /b 1
)

:: 2. Установка зависимостей (если ещё не установлены)
echo [2/4] Проверка и установка зависимостей npm...
if not exist "node_modules\" (
    echo Папка node_modules не найдена. Запускаем npm install...
    call npm install
) else (
    echo Зависимости уже установлены.
)

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] Не удалось установить зависимости npm.
    echo Попробуйте вручную запустить: npm install
    echo.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Сборка React/Vite
echo.
echo [3/4] Компиляция веб-интерфейса (Vite build)...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] Сборка интерфейса через Vite завершилась с ошибкой.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Сборка Portable EXE через Electron Builder
echo.
echo [4/4] Сборка автономного файла Cryptoimg-Portable-v5.1.0.exe...
echo      (Рабочий обход Windows Defender: сборка в C:\electron-build)
echo.

:: Рабочее обходное решение: собираем в C:\electron-build,
:: затем копируем результат в release\.
set BUILD_OUTPUT=C:\electron-build\release
if exist "%BUILD_OUTPUT%" rmdir /s /q "%BUILD_OUTPUT%"
mkdir "%BUILD_OUTPUT%"

:: Собираем portable с output в C:\electron-build\release
call npx electron-builder --win portable --config electron-builder.json --config.directories.output="%BUILD_OUTPUT%"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] electron-builder завершился с ошибкой.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

:: Копируем результат в release\ папку проекта
if not exist "release\" mkdir "release\"
copy /y "%BUILD_OUTPUT%\Cryptoimg-Portable-v5.1.0.exe" "release\" >nul
xcopy /e /i /y "%BUILD_OUTPUT%\win-unpacked" "release\win-unpacked" >nul

:: Чистим временную папку
rmdir /s /q "%BUILD_OUTPUT%"

echo.
echo ========================================================
echo  СБОРКА УСПЕШНО ЗАВЕРШЕНА!
echo.
echo  Готовый портативный файл:
echo    release\Cryptoimg-Portable-v5.1.0.exe
echo.
echo  Этот файл можно сразу запускать или скопировать
echo  на USB-флешку. Установка не требуется!
echo ========================================================
echo.

:: Открываем папку с готовым файлом в проводнике
if exist "release\" (
    explorer release
)

pause
