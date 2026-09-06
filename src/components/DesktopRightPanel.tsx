import React from 'react';
import { 
  Download,
  Eye,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Layers
} from 'lucide-react';
import { Argon2Params, Language, OutputFormat, SelfTestStep, ChannelMode, ChannelThumb } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface RightPanelProps {
  lang: Language;
  activeTab: string;
  argon2Params: Argon2Params | null;
  outputDataUrl: string | null;
  outputBlob: Blob | null;
  outputFormat: OutputFormat;
  selfTestSteps: SelfTestStep[];
  selfTestSummary: { pass: boolean; text: string } | null;
  // Channel preview (inspector)
  channelPreview: ChannelMode;
  channelThumbs: ChannelThumb[];
  channelPreviewUrl: string | null;
  inspectorImageMeta: { width: number; height: number } | null;
  onChannelPreviewChange: (mode: ChannelMode) => void;
  onChannelPreviewUrlChange: (url: string | null) => void;
}

const CHANNELS: { mode: ChannelMode; label: string }[] = [
  { mode: 'all', label: 'RGB' },
  { mode: 'r',   label: 'Red' },
  { mode: 'g',   label: 'Green' },
  { mode: 'b',   label: 'Blue' },
  { mode: 'lsb', label: '2-LSB' },
];

export const DesktopRightPanel: React.FC<RightPanelProps> = ({ 
  lang, 
  activeTab,
  argon2Params, 
  outputDataUrl,
  outputBlob,
  outputFormat,
  selfTestSteps,
  selfTestSummary,
  channelPreview,
  channelThumbs,
  channelPreviewUrl,
  inspectorImageMeta,
  onChannelPreviewChange,
  onChannelPreviewUrlChange
}) => {
  const t = TRANSLATIONS[lang];

  const handleDownload = () => {
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cryptoimg-key-${Date.now()}.${outputFormat}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleChannelSwitch = (mode: ChannelMode) => {
    onChannelPreviewChange(mode);
    const thumb = channelThumbs.find(t => t.mode === mode);
    onChannelPreviewUrlChange(thumb?.dataUrl || null);
  };

  const isEncode = activeTab === 'encode';
  const isInspector = activeTab === 'inspector';

  return (
    <aside className="w-full bg-slate-950/60 border-l border-slate-800/80 flex flex-col flex-shrink-0 z-20 overflow-y-auto">

      {/* ═══ ENCODE: Photo Key Preview + Download ═══ */}
      {isEncode && (
        <div className="p-3 border-b border-slate-800/80">
          <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <ImageIcon className="w-3 h-3" />
            PHOTO KEY PREVIEW
          </div>

          {outputDataUrl ? (
            <div className="mt-2 space-y-2">
              <div className="rounded-xl overflow-hidden bg-emerald-950/20 border border-emerald-800/30">
                <img 
                  src={outputDataUrl} 
                  alt="Encrypted key" 
                  className="w-full object-contain max-h-[180px]"
                />
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50">
                <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {t.key_ready_title}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{t.key_ready_desc}</p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.btn_download_img} ({outputFormat.toUpperCase()})</span>
              </button>
            </div>
          ) : (
            <div className="mt-2 p-4 rounded-xl border border-dashed border-slate-700/60 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 mb-2">
                <Eye className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Preview of the encrypted photo key will appear here after encoding
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ ENCODE: Internal Audit ═══ */}
      {isEncode && (
        <div className="p-3 border-b border-slate-800/80">
          <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <ClipboardList className="w-3 h-3" />
            INTERNAL AUDIT
          </div>

          <div className="mt-2 space-y-1">
            {selfTestSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60"
              >
                <span className="text-slate-300 truncate flex-1">{t[step.titleKey] || step.titleKey}</span>
                <span className="font-mono text-[10px] flex-shrink-0 ml-1">
                  {step.status === 'idle' && <span className="text-slate-600">IDLE</span>}
                  {step.status === 'running' && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    </span>
                  )}
                  {step.status === 'success' && <span className="text-emerald-400 font-bold">PASS ✓</span>}
                  {step.status === 'failed' && <span className="text-rose-400 font-bold">FAIL ✗</span>}
                </span>
              </div>
            ))}
          </div>

          {selfTestSummary && (
            <div
              className={`mt-2 p-2 rounded-lg text-[11px] font-semibold border ${
                selfTestSummary.pass
                  ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
              }`}
            >
              {selfTestSummary.pass ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline mr-1.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400 inline mr-1.5" />
              )}
              {selfTestSummary.text}
            </div>
          )}

          {!selfTestSummary && (
            <div className="mt-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 text-center">
              <p className="text-[10px] text-slate-500">
                5-stage integrity audit runs automatically during encoding
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ INSPECTOR: Channel Plane & LSB Noise ═══ */}
      {isInspector && (
        <div className="p-3 border-b border-slate-800/80">
          <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-emerald-400" />
            COLOR PLANE & LSB NOISE
          </div>

          {inspectorImageMeta ? (
            <div className="mt-2 space-y-2">
              {/* Channel buttons row */}
              <div className="grid grid-cols-5 gap-1.5 text-xs font-mono">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.mode}
                    onClick={() => handleChannelSwitch(ch.mode)}
                    className={`py-1.5 px-2 rounded-lg text-center font-bold border transition-all cursor-pointer ${
                      channelPreview === ch.mode
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* Large preview of selected channel */}
              {channelPreviewUrl ? (
                <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
                  <img
                    src={channelPreviewUrl}
                    alt={`${channelPreview.toUpperCase()} channel preview`}
                    className="w-full max-h-[280px] object-contain"
                  />
                  <div className="px-3 py-1.5 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {channelPreview.toUpperCase()} — {inspectorImageMeta.width}×{inspectorImageMeta.height}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">
                      {channelPreview === 'lsb' ? 'Amplified 2-LSB noise' : channelPreview === 'all' ? 'Full RGB composite' : `${channelPreview.toUpperCase()} channel only`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-[180px] rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center">
                  <p className="text-[10px] text-slate-600">Select image in inspector</p>
                </div>
              )}

              {/* Thumbnail strip */}
              {channelThumbs.some(t => t.dataUrl) && (
                <div className="grid grid-cols-5 gap-1.5">
                  {channelThumbs.map((ch) => (
                    <button
                      key={ch.mode}
                      onClick={() => handleChannelSwitch(ch.mode)}
                      className={`rounded-lg overflow-hidden border-2 transition-all cursor-pointer aspect-square ${
                        channelPreview === ch.mode
                          ? 'border-emerald-500 shadow-sm shadow-emerald-900/40'
                          : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                      }`}
                      title={ch.label}
                    >
                      {ch.dataUrl ? (
                        <img src={ch.dataUrl} alt={ch.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-900" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 p-6 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
              <Layers className="w-5 h-5 text-slate-700 mb-1.5" />
              <p className="text-[10px] text-slate-600 leading-tight">
                Upload an image in the inspector to view channel planes
              </p>
            </div>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />
    </aside>
  );
};
