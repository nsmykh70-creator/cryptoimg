# Сборка Android APK — Cryptoimg Mobile

## Требования

1. **Android Studio** — https://developer.android.com/studio
2. **JDK 17** — входит в Android Studio
3. **Android SDK** — устанавливается через Android Studio SDK Manager

## Быстрый старт

### 1. Установи Android Studio и открой проект

```
File → Open → выбери папку android/
```

Android Studio автоматически настроит SDK и Gradle.

### 2. Собери APK

**Debug APK (для тестирования):**
```bash
cd android
./gradlew assembleDebug
```
Файл: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (для публикации):**
```bash
cd android
./gradlew assembleRelease
```
Файл: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### 3. Подпись Release APK

Создай keystore (один раз):
```bash
keytool -genkey -v -keystore cryptoimg-release.keystore -alias cryptoimg -keyalg RSA -keysize 2048 -validity 10000
```

Подпиши APK:
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore cryptoimg-release.keystore app-release-unsigned.apk cryptoimg
zipalign -v 4 app-release-unsigned.apk Cryptoimg-v5.1.0.apk
```

## Обновление кода

После изменений в `src/`:
```bash
# 1. Пересобери web
npx vite build

# 2. Синхронизируй с Android
npx cap sync android

# 3. Открой Android Studio и собери
```

## Структура проекта

```
├── src/                    # React исходники
├── dist/                   # Собранный web (Vite)
├── android/                # Нативный Android проект (Capacitor)
│   └── app/src/main/
│       ├── assets/public/  # Web файлы
│       ├── java/           # Android код
│       └── res/            # Ресурсы (иконки и т.д.)
├── capacitor.config.ts     # Конфигурация Capacitor
└── build/                  # Иконки для Android
```

## Иконки для Android

Capacitor автоматически генерирует иконки из `build/icon.png` (256x256).
Для кастомных иконок отредактируй `android/app/src/main/res/`:

- `mipmap-mdpi/` — 48x48
- `mipmap-hdpi/` — 72x72
- `mipmap-xhdpi/` — 96x96
- `mipmap-xxhdpi/` — 144x144
- `mipmap-xxxhdpi/` — 192x192

## Плагины

| Плагин | Назначение |
|--------|-----------|
| `@capacitor/camera` | Доступ к камере и галерее |
| `@capacitor/filesystem` | Чтение/запись файлов |
| `@capacitor/share` | Нативное шаринг-меню |
| `@capacitor/preferences` | Локальное хранилище |

## Отладка

1. Подключи телефон по USB
2. Включи "USB debugging" в настройках разработчика
3. В Android Studio нажми ▶️ Run
4. Или используй Chrome: `chrome://inspect` → WebView
