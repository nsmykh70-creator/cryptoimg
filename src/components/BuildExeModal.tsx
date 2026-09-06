import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Check, 
  Copy, 
  Download, 
  Package, 
  Cpu, 
  ShieldCheck, 
  FolderArchive,
  HardDrive,
  FileCode,
  Sparkles,
  Usb,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Language } from '../types';

interface BuildExeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const BuildExeModal: React.FC<BuildExeModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'portable' | 'installer'>('portable');

  if (!isOpen) return null;

  const handleCopy = async (cmd: string, id: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCmd(id);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadPortableBat = () => {
    const batContent = `@echo off
title Cryptoimg Desktop - Portable EXE Builder
color 0B

echo ========================================================
echo     Cryptoimg Desktop v5.1 - Standalone PORTABLE Build
echo ========================================================
echo.

echo [1/3] Checking Node.js and dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install npm dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Building production web assets (Vite)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vite production build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Packaging Standalone Portable .EXE...
call npx electron-builder --win portable --config electron-builder.json
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] electron-builder failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo  PORTABLE BUILD SUCCESSFUL!
echo.
echo  Output single-file executable:
echo    - release\\Cryptoimg-Portable-v5.1.0.exe
echo.
echo  This executable can be run directly from any USB flash
echo  drive or secure storage without installation!
echo ========================================================
echo.
pause
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-portable.bat';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadInstallerBat = () => {
    const batContent = `@echo off
title Cryptoimg Desktop - Windows Installer Builder
color 0A

echo ========================================================
echo         Cryptoimg Desktop v5.1 - Windows EXE Build
echo ========================================================
echo.

echo [1/3] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Building production assets (Vite)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm run build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Packaging Windows Installer & Portable...
call npx electron-builder --win --config electron-builder.json
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] electron-builder failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo  BUILD COMPLETE!
echo  Binaries are in the "release\\" directory:
echo    - release\\Cryptoimg-5.1.0-x64.exe (Installer)
echo    - release\\Cryptoimg-Portable-v5.1.0.exe (Portable EXE)
echo ========================================================
echo.
pause
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-exe.bat';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Сборка исполняемых файлов для Windows
                <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800/60 font-mono">
                  v5.1 Desktop & Portable
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Автономные и портативные сборки Electron</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-5 pt-3 pb-0 bg-slate-950/40 flex gap-2 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('portable')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'portable'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            <span>1. Portable версия (.EXE без установки)</span>
          </button>

          <button
            onClick={() => setActiveTab('installer')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'installer'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>2. Стандартный инсталлятор (NSIS)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {activeTab === 'portable' ? (
            <>
              {/* Portable Highlights */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 via-slate-950 to-slate-950 border border-teal-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Usb className="w-4 h-4 text-teal-400" />
                    <div>
                      <span className="font-bold text-slate-100 text-sm">Cryptoimg-Portable-v5.1.0.exe</span>
                      <p className="text-[11px] text-teal-300/90 font-mono">Один исполняемый файл · Запуск с флешки</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadPortableBat}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать build-portable.bat</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Портативная версия не требует прав администратора и не оставляет следов в системных папках Windows (<code className="font-mono text-teal-300">AppData\Roaming</code>). Все временные данные изолированы.
                </p>
              </div>

              {/* Portable Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold text-[11px]">
                    <Usb className="w-3.5 h-3.5" />
                    <span>USB Ready</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Скопируйте файл на защищённую флешку и запускайте на любом ПК с Windows.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Zero Traces</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Не пишет в реестр Windows и хранит профиль в локальной директории.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Air-Gapped</span>
                  </div>
                  <p className="text-[10px] text-slate-400">100% автономная работа на изолированных от сети компьютерах.</p>
                </div>
              </div>

              {/* Command for Portable */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-teal-400" />
                  Команда сборки Portable версии:
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="font-mono text-xs text-slate-200 select-all overflow-x-auto">
                    npm run dist:portable
                  </div>
                  <button
                    onClick={() => handleCopy('npm run dist:portable', 'dist_port')}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedCmd === 'dist_port' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'dist_port' ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Installer Highlights */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-slate-100 text-sm">Cryptoimg-5.1.0-x64.exe</span>
                      <p className="text-[11px] text-emerald-300/90 font-mono">NSIS Мастер установки · Ярлыки в системе</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadInstallerBat}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать build-exe.bat</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Полноценный инсталлятор для Windows: выбирает путь установки, создаёт ярлыки на рабочем столе, в меню «Пуск» и регистрирует деинсталлятор.
                </p>
              </div>

              {/* Command for Installer */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Команда сборки полного пакета (Инсталлятор + Portable):
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="font-mono text-xs text-slate-200 select-all overflow-x-auto">
                    npm run dist:win
                  </div>
                  <button
                    onClick={() => handleCopy('npm run dist:win', 'dist_win')}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedCmd === 'dist_win' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'dist_win' ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Security & Offline Guarantee */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Гарантия безопасности десктопной среды</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside leading-relaxed">
              <li><b>100% Offline:</b> Приложение не отправляет сетевых запросов и работает без подключения к интернету.</li>
              <li><b>Chromium Sandbox:</b> Изоляция контекста (<code className="font-mono text-slate-300">contextIsolation: true</code>) с блокировкой небезопасных Node.js вызовов в UI.</li>
              <li><b>Очистка ОЗУ:</b> Автоматическая санитация буферов ключей в оперативной памяти после криптографических операций.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/70">
          <span className="text-[11px] text-slate-500 font-mono">electron-builder v26.15 · electron v44.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

