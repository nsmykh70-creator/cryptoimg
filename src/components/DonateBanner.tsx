import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface DonateBannerProps {
  lang: Language;
  /** seconds before auto-collapse; default 10 */
  countdownFrom?: number;
  /** compact mode for sidebar (smaller QR + tighter spacing) */
  compact?: boolean;
}

const WALLETS = [
  { coin: 'btc', symbol: 'BTC', color: 'bg-amber-400', address: 'bc1q8f6sxqsmrt5l57at3vqmuhg4saa3p822n7klca', uri: 'bitcoin:bc1q8f6sxqsmrt5l57at3vqmuhg4saa3p822n7klca' },
  { coin: 'eth', symbol: 'ETH', color: 'bg-indigo-400', address: '0xD8F2cFE3B7D0864DC4db3Afda52C7a30978Df703', uri: 'ethereum:0xD8F2cFE3B7D0864DC4db3Afda52C7a30978Df703' },
  { coin: 'usdt', symbol: 'USDT', color: 'bg-emerald-400', address: 'TFRHPnSJMa4pm7WPxKYH5UuYZeHM9cLAuP', uri: 'TFRHPnSJMa4pm7WPxKYH5UuYZeHM9cLAuP' }
] as const;

/* ───── tiny QR wallet row (reused from DesktopSidebar) ───── */
const QRWalletRow: React.FC<{ wallet: typeof WALLETS[number]; compact?: boolean }> = ({ wallet, compact }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const size = compact ? 40 : 48;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, wallet.uri, {
        width: compact ? 64 : 80,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      });
    }
  }, [wallet.uri, compact]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <div className="p-1 bg-white rounded-md flex-shrink-0">
        <canvas ref={canvasRef} className="rounded" style={{ width: size, height: size }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${wallet.color}`} />
            <span className="text-[10px] font-bold text-slate-300">{wallet.symbol}</span>
          </div>
          <button onClick={handleCopy} className="text-[9px] text-slate-500 hover:text-emerald-400 flex items-center gap-0.5 transition-colors" title="Copy address">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <div className="text-[8px] font-mono text-slate-500 truncate mt-0.5 select-all" title={wallet.address}>{wallet.address}</div>
      </div>
    </div>
  );
};

/* ───── countdown ring SVG ───── */
const CountdownRing: React.FC<{ seconds: number; total: number }> = ({ seconds, total }) => {
  const pct = seconds / total;
  const r = 8;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width="22" height="22" className="flex-shrink-0 -rotate-90">
      <circle cx="11" cy="11" r={r} fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="2.5" />
      <circle
        cx="11" cy="11" r={r} fill="none"
        stroke="rgb(251,191,36)"
        strokeWidth="2.5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-linear"
      />
      <text x="11" y="11" textAnchor="middle" dominantBaseline="central"
        className="fill-amber-400 text-[9px] font-bold rotate-90" style={{ transformOrigin: '11px 11px' }}>
        {seconds}
      </text>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DonateBanner — the main exported component
   ═══════════════════════════════════════════════════════════════ */
export const DonateBanner: React.FC<DonateBannerProps> = ({
  lang,
  countdownFrom = 10,
  compact = false
}) => {
  const t = TRANSLATIONS[lang];
  const [expanded, setExpanded] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(countdownFrom);
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const collapse = useCallback(() => {
    setExpanded(false);
    setAutoCollapsed(true);
  }, []);

  /* countdown logic */
  useEffect(() => {
    if (!expanded) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setSecondsLeft(countdownFrom);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          collapse();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [expanded, countdownFrom, collapse]);

  const toggle = () => {
    if (expanded) {
      collapse();
    } else {
      setExpanded(true);
      setAutoCollapsed(false);
    }
  };

  /* ─── Collapsed toggle button (dropdown trigger) ─── */
  if (!expanded) {
    return (
      <div className="px-3 pb-2">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/50 hover:bg-amber-950/60 transition-all group cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 group-hover:fill-amber-400/60 transition-all" />
          <span className="text-[10px] font-bold text-amber-300/80 uppercase tracking-wider flex-1 text-left">
            {t.donate_banner_title}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
        </button>

        {autoCollapsed && expanded === false && (
          /* hidden panel that slides down when toggle is clicked */
          null
        )}
      </div>
    );
  }

  /* ─── Expanded banner (countdown + content) ─── */
  return (
    <div className="px-3 pb-2">
      {/* Header bar with countdown + collapse button */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-amber-950/40 border border-amber-800/50 border-b-0">
        <Heart className="w-3 h-3 text-amber-400 fill-amber-400/40" />
        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex-1">
          {t.donate_banner_title}
        </span>
        <CountdownRing seconds={secondsLeft} total={countdownFrom} />
        <button onClick={collapse} className="text-amber-500/60 hover:text-amber-300 transition-colors" title="Свернуть">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Wallet QR cards */}
      <div className="space-y-2 p-2.5 rounded-b-lg bg-slate-900/70 border border-amber-800/30 border-t-0">
        {WALLETS.map((w) => (
          <QRWalletRow key={w.coin} wallet={w} compact={compact} />
        ))}
      </div>
    </div>
  );
};
