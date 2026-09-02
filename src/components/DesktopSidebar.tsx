import React from 'react';
import { 
  Lock, 
  Unlock, 
  BarChart3, 
  Cpu, 
  Heart, 
  Trash2, 
  HelpCircle,
  FileCheck2,
  Layers
} from 'lucide-react';
import { ActiveTab, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { DonateBanner } from './DonateBanner';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lang: Language;
  onWipeMemory: () => void;
  memoryWiped: boolean;
  onOpenHelp: () => void;
}



export const DesktopSidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  lang,
  onWipeMemory,
  memoryWiped,
  onOpenHelp
}) => {
  const t = TRANSLATIONS[lang];

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'encode',
      label: t.tab_encode,
      icon: <Lock className="w-4 h-4" />,
      badge: 'v5.1'
    },
    {
      id: 'decode',
      label: t.tab_decode,
      icon: <Unlock className="w-4 h-4" />
    },
    {
      id: 'inspector',
      label: t.tab_inspector,
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'album-encode',
      label: t.tab_album_encode || 'Album Encode',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      badge: 'NEW'
    },
    {
      id: 'album-decode',
      label: t.tab_album_decode || 'Album Decode',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'benchmark',
      label: t.tab_benchmark,
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: 'donate',
      label: t.tab_donate,
      icon: <Heart className="w-4 h-4 text-amber-400" />
    }
  ];

  return (
    <aside className="w-60 bg-slate-950/60 border-r border-slate-800/80 flex flex-col justify-between select-none flex-shrink-0 z-20">
      {/* Upper Navigation Items */}
      <div className="p-3 space-y-1.5">
        <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
          WORKSPACES
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group text-left ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`transition-transform duration-200 ${isActive ? 'text-emerald-400 scale-105' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-800/50">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Donate Crypto — auto-collapsible banner */}
      <DonateBanner lang={lang} compact />

      {/* Bottom Actions: Memory Sanitize & Engine Status */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/90 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              RS(255, 191) ECC
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/60">
              ACTIVE
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Corrects up to 32 corrupted bytes per 255-byte block.
          </p>
        </div>

        <button
          onClick={onWipeMemory}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
            memoryWiped
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : 'bg-slate-900 hover:bg-rose-950/40 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 border-slate-800'
          }`}
          title="Zero out all in-memory cryptographic keys and sensitive plaintext"
        >
          <Trash2 className={`w-3.5 h-3.5 ${memoryWiped ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>{memoryWiped ? 'Memory Sanitized ✓' : 'Sanitize RAM'}</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 py-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Security Architecture FAQ</span>
        </button>
      </div>
    </aside>
  );
};
