@echo off
chcp 65001 > nul
title Cryptoimg Mobile - Android APK Builder
color 0B

echo ========================================================
echo     Cryptoimg Mobile v5.1 - Android APK Builder
echo ========================================================
echo.

:: 1. Check Node.js
echo [1/4] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js not found!
    pause
    exit /b 1
)

:: 2. Build web app
echo [2/4] Building web app (Vite)...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Vite build failed.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Sync with Android
echo.
echo [3/4] Syncing with Android (Capacitor)...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Capacitor sync failed.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Build APK
echo.
echo [4/4] Opening Android Studio for APK build...
echo.
echo   To build APK manually:
echo     cd android
echo     gradlew assembleDebug
echo.
echo   Or open android/ folder in Android Studio
echo   and click Build → Build Bundle(s) / APK(s)
echo.

if exist "android\" (
    echo Opening Android Studio...
    start "" "android"
)

echo.
echo ========================================================
echo  SYNC COMPLETE!
echo.
echo  Next steps:
echo    1. Open android/ in Android Studio
echo    2. Click Build → Build Bundle(s) / APK(s)
echo    3. Find APK in android/app/build/outputs/apk/
echo ========================================================
echo.

pause
