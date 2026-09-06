import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Argon2Params, Language, OutputFormat, SelfTestStep, ChannelMode, ChannelThumb } from './types';
import { getArgon2Params, wipeAllSecrets, ARGON2_BENCHMARK_KEY } from './crypto/engine';
import { DesktopTitlebar } from './components/DesktopTitlebar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopStatusBar } from './components/DesktopStatusBar';
import { MobileNav } from './components/MobileNav';
import { EncodeView } from './components/EncodeView';
import { DecodeView } from './components/DecodeView';
import { StegoInspectorView } from './components/StegoInspectorView';
import { BenchmarkView } from './components/BenchmarkView';
import { DonationView } from './components/DonationView';
import { SecurityHelpModal } from './components/SecurityHelpModal';
import { GuideModal } from './components/GuideModal';
import { DonateBanner } from './components/DonateBanner';
import { DesktopRightPanel } from './components/DesktopRightPanel';
import { AlbumEncodeView } from './components/AlbumEncodeView';
import { AlbumDecodeView } from './components/AlbumDecodeView';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

const DEFAULT_SELF_TEST_STEPS: SelfTestStep[] = [
  { id: 1, titleKey: 'st_step1', status: 'idle' },
  { id: 2, titleKey: 'st_step2', status: 'idle' },
  { id: 3, titleKey: 'st_step3', status: 'idle' },
  { id: 4, titleKey: 'st_step4', status: 'idle' },
  { id: 5, titleKey: 'st_step5', status: 'idle' }
];

export default function App() {
  const [lang, setLang] = useState<Language>('ru');
  const [activeTab, setActiveTab] = useState<ActiveTab>('encode');
  const [argon2Params, setArgon2Params] = useState<Argon2Params | null>(null);
  const [memoryWiped, setMemoryWiped] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // Lifted encode output state — shared with DesktopRightPanel
  const [outputDataUrl, setOutputDataUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [selfTestSteps, setSelfTestSteps] = useState<SelfTestStep[]>(DEFAULT_SELF_TEST_STEPS);
  const [selfTestSummary, setSelfTestSummary] = useState<{ pass: boolean; text: string } | null>(null);

  // Channel preview state — shared between inspector and right panel
  const [channelPreview, setChannelPreview] = useState<ChannelMode>('all');
  const [channelThumbs, setChannelThumbs] = useState<ChannelThumb[]>([]);
  const [channelPreviewUrl, setChannelPreviewUrl] = useState<string | null>(null);
  const [inspectorImageMeta, setInspectorImageMeta] = useState<{ width: number; height: number } | null>(null);

  // Right panel has content only for encode and inspector tabs
  const hasRightPanelContent = activeTab === 'encode' || activeTab === 'inspector';


  // Initialize Language & Background Benchmark on startup
  useEffect(() => {
    // Check localStorage first (set by landing page)
    const savedLang = localStorage.getItem('cryptoimg-lang') as Language | null;
    if (savedLang && ['ru','en','es','de','fr','zh'].includes(savedLang)) {
      setLang(savedLang);
    } else {
      const navLang = navigator.language?.slice(0, 2);
      if (['ru','en','es','de','fr','zh'].includes(navLang)) {
        setLang(navLang as Language);
      }
    }

    // Listen for language changes from landing page
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && ['ru','en','es','de','fr','zh'].includes(detail)) {
        setLang(detail as Language);
      }
    };
    document.addEventListener('cryptoimg-lang-change', handler);

    // Use default params immediately so UI renders without blocking
    const cached = localStorage.getItem(ARGON2_BENCHMARK_KEY);
    if (cached) {
      try {
        const stored = JSON.parse(cached);
        if (stored?.params) {
          setArgon2Params(stored.params);
          return;
        }
      } catch {}
    }
    // No cache — set defaults immediately, run benchmark in background
    setArgon2Params({ memory: 65536, iterations: 3, parallelism: 4, benchmarkMs: 0 });
    setTimeout(() => {
      getArgon2Params(true).then((params) => setArgon2Params(params));
    }, 500);

    return () => document.removeEventListener('cryptoimg-lang-change', handler);
  }, []);

  const handleWipeMemory = () => {
    wipeAllSecrets();
    setMemoryWiped(true);
    setTimeout(() => {
      setMemoryWiped(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans select-none antialiased" style={{overflow:'clip'}}>
      {isMobile ? (
        /* ===== MOBILE LAYOUT ===== */
        <>
          {/* Mobile Header */}
          <header className="h-12 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between flex-shrink-0 z-30 safe-area-top">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide text-slate-200">CRYPTOIMG</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-mono font-semibold">v5.1</span>
              </div>
            </div>
          </header>

          {/* Mobile Donate Banner — auto-collapses after 10s */}
          <DonateBanner lang={lang} compact={false} />

          {/* Mobile Content */}
          <main className="flex-1 overflow-y-auto overscroll-contain bg-slate-900/50 pb-20">
            {activeTab === 'encode' && argon2Params && (
              <EncodeView
                lang={lang}
                argon2Params={argon2Params}
                outputDataUrl={outputDataUrl}
                outputBlob={outputBlob}
                outputFormat={outputFormat}
                selfTestSteps={selfTestSteps}
                selfTestSummary={selfTestSummary}
                onOutputChange={(dataUrl, blob, format) => {
                  setOutputDataUrl(dataUrl);
                  setOutputBlob(blob);
                  setOutputFormat(format);
                }}
                onSelfTestChange={(steps, summary) => {
                  setSelfTestSteps(steps);
                  setSelfTestSummary(summary);
                }}
              />
            )}
            {activeTab === 'decode' && <DecodeView lang={lang} />}
            {activeTab === 'inspector' && (
              <StegoInspectorView
                lang={lang}
                channelPreview={channelPreview}
                onChannelPreviewChange={setChannelPreview}
                onThumbsGenerated={setChannelThumbs}
                onPreviewUrlChange={setChannelPreviewUrl}
                onImageMetaChange={setInspectorImageMeta}
              />
            )}
            {activeTab === 'album-encode' && argon2Params && <AlbumEncodeView lang={lang} argon2Params={argon2Params} />}
            {activeTab === 'album-decode' && <AlbumDecodeView lang={lang} />}
            {activeTab === 'benchmark' && <BenchmarkView lang={lang} params={argon2Params} onUpdateParams={setArgon2Params} />}
            {activeTab === 'donate' && <DonationView lang={lang} />}
            {/* Inline right-panel content on mobile */}
            {activeTab === 'encode' && (
              <div className="px-4 pb-4">
                <DesktopRightPanel
                  lang={lang}
                  activeTab={activeTab}
                  argon2Params={argon2Params}
                  outputDataUrl={outputDataUrl}
                  outputBlob={outputBlob}
                  outputFormat={outputFormat}
                  selfTestSteps={selfTestSteps}
                  selfTestSummary={selfTestSummary}
                  channelPreview={channelPreview}
                  channelThumbs={channelThumbs}
                  channelPreviewUrl={channelPreviewUrl}
                  inspectorImageMeta={inspectorImageMeta}
                  onChannelPreviewChange={setChannelPreview}
                  onChannelPreviewUrlChange={setChannelPreviewUrl}
                />
              </div>
            )}
            {activeTab === 'inspector' && channelThumbs.length > 0 && (
              <div className="px-4 pb-4">
                <DesktopRightPanel
                  lang={lang}
                  activeTab={activeTab}
                  argon2Params={argon2Params}
                  outputDataUrl={outputDataUrl}
                  outputBlob={outputBlob}
                  outputFormat={outputFormat}
                  selfTestSteps={selfTestSteps}
                  selfTestSummary={selfTestSummary}
                  channelPreview={channelPreview}
                  channelThumbs={channelThumbs}
                  channelPreviewUrl={channelPreviewUrl}
                  inspectorImageMeta={inspectorImageMeta}
                  onChannelPreviewChange={setChannelPreview}
                  onChannelPreviewUrlChange={setChannelPreviewUrl}
                />
              </div>
            )}
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileNav activeTab={activeTab} onSelectTab={setActiveTab} lang={lang} />
        </>
      ) : (
        /* ===== DESKTOP LAYOUT ===== */
        <>
          <DesktopTitlebar
            lang={lang}
            onSetLang={setLang}
            argon2Params={argon2Params}
            onOpenBenchmark={() => setActiveTab('benchmark')}
            onOpenDonate={() => setActiveTab('donate')}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
          <div className="grid flex-1 overflow-hidden relative" style={{gridTemplateColumns: hasRightPanelContent ? '15rem 1fr minmax(0, 1fr)' : '15rem 1fr 0'}}>
            <DesktopSidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              lang={lang}
              onWipeMemory={handleWipeMemory}
              memoryWiped={memoryWiped}
              onOpenHelp={() => setIsHelpOpen(true)}
              argon2Params={argon2Params}
            />
            <main className="overflow-hidden bg-slate-900/50 relative min-w-0">
              {activeTab === 'encode' && argon2Params && (
                <EncodeView
                  lang={lang}
                  argon2Params={argon2Params}
                  outputDataUrl={outputDataUrl}
                  outputBlob={outputBlob}
                  outputFormat={outputFormat}
                  selfTestSteps={selfTestSteps}
                  selfTestSummary={selfTestSummary}
                  onOutputChange={(dataUrl, blob, format) => {
                    setOutputDataUrl(dataUrl);
                    setOutputBlob(blob);
                    setOutputFormat(format);
                  }}
                  onSelfTestChange={(steps, summary) => {
                    setSelfTestSteps(steps);
                    setSelfTestSummary(summary);
                  }}
                />
              )}
              {activeTab === 'decode' && <DecodeView lang={lang} />}
              {activeTab === 'inspector' && (
                <StegoInspectorView
                  lang={lang}
                  channelPreview={channelPreview}
                  onChannelPreviewChange={setChannelPreview}
                  onThumbsGenerated={setChannelThumbs}
                  onPreviewUrlChange={setChannelPreviewUrl}
                  onImageMetaChange={setInspectorImageMeta}
                />
              )}
              {activeTab === 'album-encode' && argon2Params && <AlbumEncodeView lang={lang} argon2Params={argon2Params} />}
              {activeTab === 'album-decode' && <AlbumDecodeView lang={lang} />}
              {activeTab === 'benchmark' && <BenchmarkView lang={lang} params={argon2Params} onUpdateParams={setArgon2Params} />}
              {activeTab === 'donate' && <DonationView lang={lang} />}
            </main>
            <DesktopRightPanel
              lang={lang}
              activeTab={activeTab}
              argon2Params={argon2Params}
              outputDataUrl={outputDataUrl}
              outputBlob={outputBlob}
              outputFormat={outputFormat}
              selfTestSteps={selfTestSteps}
              selfTestSummary={selfTestSummary}
              channelPreview={channelPreview}
              channelThumbs={channelThumbs}
              channelPreviewUrl={channelPreviewUrl}
              inspectorImageMeta={inspectorImageMeta}
              onChannelPreviewChange={setChannelPreview}
              onChannelPreviewUrlChange={setChannelPreviewUrl}
            />
          </div>
          <DesktopStatusBar lang={lang} argon2Params={argon2Params} memoryWiped={memoryWiped} />
      </>
      )}

      <SecurityHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} lang={lang} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} lang={lang} />
    </div>
  );
}
