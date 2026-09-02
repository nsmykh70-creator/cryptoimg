import React from 'react';
import { ShieldCheck, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';
import { Argon2Params, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface StatusBarProps {
  lang: Language;
  argon2Params: Argon2Params | null;
  memoryWiped: boolean;
}

export const DesktopStatusBar: React.FC<StatusBarProps> = ({
  lang,
  argon2Params,
  memoryWiped
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="h-7 bg-slate-950/90 border-t border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none flex-shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>WebCrypto AES-GCM</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-1 text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Argon2id WASM</span>
          {argon2Params && (
            <span className="text-[10px] text-slate-500">
              ({argon2Params.memory / 1024}MB)
            </span>
          )}
        </div>

        <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1 text-slate-300">
          <HardDrive className="w-3.5 h-3.5 text-teal-400" />
          <span>RS(255,191) ECC</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${memoryWiped ? 'bg-emerald-400' : 'bg-emerald-500 animate-soft-pulse'}`} />
          <span className={memoryWiped ? 'text-emerald-400' : 'text-slate-400'}>
            {memoryWiped ? t.memory_clean : 'Local Sandbox Active'}
          </span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800" />

        <span className="text-slate-500 font-bold">CRYPTOIMG v5.1</span>
      </div>
    </footer>
  );
};
