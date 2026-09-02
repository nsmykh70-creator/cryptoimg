import React from 'react';
import { Lock, Unlock, Heart, Layers } from 'lucide-react';
import { ActiveTab, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface MobileNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lang: Language;
}

const NAV_ITEMS: { id: ActiveTab; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'encode', labelKey: 'tab_encode', icon: <Lock className="w-5 h-5" /> },
  { id: 'decode', labelKey: 'tab_decode', icon: <Unlock className="w-5 h-5" /> },
  { id: 'album-encode', labelKey: 'tab_album_encode', icon: <Layers className="w-5 h-5" /> },
  { id: 'album-decode', labelKey: 'tab_album_decode', icon: <Layers className="w-5 h-5" /> },
  { id: 'donate', labelKey: 'tab_donate', icon: <Heart className="w-5 h-5" /> },
];

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onSelectTab, lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[56px] ${
                isActive
                  ? 'text-emerald-400 bg-emerald-950/50'
                  : 'text-slate-500 active:text-slate-300'
              }`}
            >
              <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[9px] font-semibold leading-tight">
                {t[item.labelKey as keyof typeof t] || item.labelKey}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
