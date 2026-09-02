import React from 'react';
import { Shield, Cpu, Lock, Sparkles } from 'lucide-react';
import { Argon2Params, Language } from '../types';

interface TitlebarProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  argon2Params: Argon2Params | null;
  onOpenBenchmark: () => void;
  onOpenDonate: () => void;
}

export const DesktopTitlebar: React.FC<TitlebarProps> = ({
  lang,
  onSetLang,
  argon2Params,
  onOpenBenchmark,
  onOpenDonate
}) => {
  return (
    <header className="h-11 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 flex items-center justify-between select-none z-30 flex-shrink-0">
      {/* App Identity */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs tracking-wide text-slate-200">CRYPTOIMG</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-mono font-semibold">
            v5.1 DESKTOP
          </span>
        </div>
      </div>

      {/* Middle Drag Area / Security indicator */}
      <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-full">
        <Lock className="w-3 h-3 text-emerald-400" />
        <span>AES-256-GCM + Argon2id + RS(255,191)</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
      </div>

      {/* Right Controls: Build EXE, Benchmark Badge, Donate & Lang Switcher */}
      <div className="flex items-center gap-2">
        {argon2Params && (
          <button
            onClick={onOpenBenchmark}
            className="flex items-center gap-1.5 text-[11px] bg-slate-900 hover:bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/60 transition-all font-mono"
            title="Argon2 Tuning Parameters"
          >
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>{argon2Params.memory / 1024}MB (t={argon2Params.iterations})</span>
          </button>
        )}

        <button
          onClick={onOpenDonate}
          className="flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md transition-all cursor-pointer"
          title="Support the Project"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">Donate</span>
        </button>
      </div>
    </header>
  );
};

