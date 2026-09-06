import React, { useState, useEffect, useRef } from 'react';
import { Shield, Cpu, Lock, Sparkles, ChevronDown, Check, Globe, BookOpen } from 'lucide-react';
import { Argon2Params, Language } from '../types';

interface TitlebarProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  argon2Params: Argon2Params | null;
  onOpenBenchmark: () => void;
  onOpenDonate: () => void;
  onOpenGuide: () => void;
}

const LANG_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export const DesktopTitlebar: React.FC<TitlebarProps> = ({
  lang,
  onSetLang,
  argon2Params,
  onOpenBenchmark,
  onOpenDonate,
  onOpenGuide
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = LANG_OPTIONS.find((l) => l.code === lang) || LANG_OPTIONS[0];

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

        {/* Language Selector — next to logo */}
        <div className="relative ml-1" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <Globe className="w-3 h-3 text-slate-400" />
            <span className="text-base leading-none">{currentLang.flag}</span>
            <ChevronDown className={`w-2.5 h-2.5 text-slate-500 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden min-w-[130px]">
              {LANG_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  onClick={() => {
                    onSetLang(option.code);
                    localStorage.setItem('cryptoimg-lang', option.code);
                    document.dispatchEvent(new CustomEvent('cryptoimg-lang-change', { detail: option.code }));
                    setLangOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                    lang === option.code
                      ? 'bg-emerald-600/20 text-emerald-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <span className="text-sm leading-none">{option.flag}</span>
                  <span>{option.label}</span>
                  {lang === option.code && <Check className="w-3 h-3 text-emerald-400 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle Drag Area / Security indicator */}
      <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-full">
        <Lock className="w-3 h-3 text-emerald-400" />
        <span>AES-256-GCM + Argon2id + RS(255,191)</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
      </div>

      {/* Right Controls: Build EXE, Benchmark Badge, Donate */}
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
          onClick={onOpenGuide}
          className="flex items-center gap-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md transition-all cursor-pointer"
          title="Guide / Руководство"
        >
          <BookOpen className="w-3 h-3" />
          <span className="hidden sm:inline">Guide</span>
        </button>

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
