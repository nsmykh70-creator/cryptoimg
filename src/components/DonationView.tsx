import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Copy, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  Shield, 
  Code
} from 'lucide-react';
import QRCode from 'qrcode';
import { Language, WalletInfo } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface DonationViewProps {
  lang: Language;
}

export const DonationView: React.FC<DonationViewProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const WALLETS: WalletInfo[] = [
    {
      coin: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      network: 'Bitcoin Native (SegWit)',
      address: 'bc1q8f6sxqsmrt5l57at3vqmuhg4saa3p822n7klca',
      uri: 'bitcoin:bc1q8f6sxqsmrt5l57at3vqmuhg4saa3p822n7klca',
      warningKey: 'donate_warn_btc'
    },
    {
      coin: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      network: 'ERC-20 (Ethereum)',
      address: '0xD8F2cFE3B7D0864DC4db3Afda52C7a30978Df703',
      uri: 'ethereum:0xD8F2cFE3B7D0864DC4db3Afda52C7a30978Df703',
      warningKey: 'donate_warn_eth'
    },
    {
      coin: 'usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      network: 'TRC-20 (Tron Network)',
      address: 'TFRHPnSJMa4pm7WPxKYH5UuYZeHM9cLAuP',
      uri: 'TFRHPnSJMa4pm7WPxKYH5UuYZeHM9cLAuP',
      warningKey: 'donate_warn_usdt'
    }
  ];

  const [selectedCoin, setSelectedCoin] = useState<'btc' | 'eth' | 'usdt'>('btc');
  const [copiedCoin, setCopiedCoin] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeWallet = WALLETS.find((w) => w.coin === selectedCoin) || WALLETS[0];

  useEffect(() => {
    if (canvasRef.current && activeWallet) {
      QRCode.toCanvas(canvasRef.current, activeWallet.uri, {
        width: 180,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      }, (err) => {
        if (err) console.error('QR code generation error:', err);
      });
    }
  }, [selectedCoin, activeWallet]);

  const handleCopy = async (address: string, coin: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedCoin(coin);
      setTimeout(() => setCopiedCoin(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          {t.donate_title}
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{t.donate_subtitle}</p>
      </div>

      {/* Main Donation Card */}
      <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-6 shadow-xl">
        {/* Coin Selector Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 max-w-md mx-auto">
          {WALLETS.map((w) => {
            const isSelected = selectedCoin === w.coin;
            return (
              <button
                key={w.coin}
                onClick={() => setSelectedCoin(w.coin)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  w.coin === 'btc' ? 'bg-amber-400' : w.coin === 'eth' ? 'bg-indigo-400' : 'bg-emerald-400'
                }`} />
                <span>{w.symbol}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Wallet Details */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-center">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-700">
              <canvas ref={canvasRef} className="rounded" />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{t.donate_scan_qr}</span>
          </div>

          {/* Info & Copy Box */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-100">{activeWallet.name} ({activeWallet.symbol})</h3>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900/60">
                  {activeWallet.network}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">{t.donate_addr_label}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-200 break-all select-all">
                  {activeWallet.address}
                </div>
                <button
                  onClick={() => handleCopy(activeWallet.address, activeWallet.coin)}
                  className={`px-3 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
                    copiedCoin === activeWallet.coin
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {copiedCoin === activeWallet.coin ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t.donate_copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t.donate_copy}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Warning Box */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{t[activeWallet.warningKey] || activeWallet.warningKey}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
          <Shield className="w-4 h-4 text-emerald-400" />
          <p className="text-xs font-bold text-slate-200">100% Zero-Knowledge</p>
          <p className="text-[11px] text-slate-400">All cryptographic primitives and image transforms happen locally inside your memory.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
          <Code className="w-4 h-4 text-indigo-400" />
          <p className="text-xs font-bold text-slate-200">Open Cryptography</p>
          <p className="text-[11px] text-slate-400">Standardized RFC 9106 Argon2id, NIST AES-256-GCM AEAD, and QR-code-grade Reed-Solomon.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-bold text-slate-200">Developer Backed</p>
          <p className="text-[11px] text-slate-400">Your contributions support continuous cryptographic audits, updates, and maintenance.</p>
        </div>
      </div>
    </div>
  );
};
