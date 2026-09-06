import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  BarChart3, UploadCloud, Layers, HardDrive, CheckCircle2, AlertTriangle,
  Info, RefreshCw, Eye
} from 'lucide-react';
import { ImageMeta, Language, ChannelMode, ChannelThumb } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { computeVarianceMap } from '../crypto/engine';

interface StegoInspectorViewProps {
  lang: Language;
  channelPreview: ChannelMode;
  onChannelPreviewChange: (mode: ChannelMode) => void;
  onThumbsGenerated: (thumbs: ChannelThumb[]) => void;
  onPreviewUrlChange: (url: string | null) => void;
  onImageMetaChange: (meta: { width: number; height: number } | null) => void;
}

const CHANNELS: { mode: ChannelMode; label: string; color: string }[] = [
  { mode: 'all', label: 'RGB', color: 'bg-slate-500' },
  { mode: 'r',   label: 'Red', color: 'bg-red-500' },
  { mode: 'g',   label: 'Green', color: 'bg-emerald-500' },
  { mode: 'b',   label: 'Blue', color: 'bg-blue-500' },
  { mode: 'lsb', label: '2-LSB', color: 'bg-amber-500' },
];

export const StegoInspectorView: React.FC<StegoInspectorViewProps> = ({
  lang, channelPreview, onChannelPreviewChange, onThumbsGenerated, onPreviewUrlChange, onImageMetaChange
}) => {
  const t = TRANSLATIONS[lang];

  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [varianceScore, setVarianceScore] = useState<number | null>(null);
  const [suitability, setSuitability] = useState<'high' | 'medium' | 'low' | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate all channel thumbnails from stored ImageData
  const generateThumbs = useCallback((imgData: ImageData, width: number, height: number) => {
    const thumbW = 120;
    const thumbH = Math.round((height / width) * thumbW);
    const results: ChannelThumb[] = [];

    for (const ch of CHANNELS) {
      const offscreen = document.createElement('canvas');
      offscreen.width = thumbW;
      offscreen.height = thumbH;
      const ctx = offscreen.getContext('2d')!;

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = width;
      fullCanvas.height = height;
      const fCtx = fullCanvas.getContext('2d')!;
      const copy = fCtx.createImageData(width, height);

      for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i];
        const g = imgData.data[i + 1];
        const b = imgData.data[i + 2];
        switch (ch.mode) {
          case 'all':
            copy.data[i] = r; copy.data[i+1] = g; copy.data[i+2] = b;
            break;
          case 'r':
            copy.data[i] = r; copy.data[i+1] = 0; copy.data[i+2] = 0;
            break;
          case 'g':
            copy.data[i] = 0; copy.data[i+1] = g; copy.data[i+2] = 0;
            break;
          case 'b':
            copy.data[i] = 0; copy.data[i+1] = 0; copy.data[i+2] = b;
            break;
          case 'lsb':
            copy.data[i]   = (r & 0x03) * 85;
            copy.data[i+1] = (g & 0x03) * 85;
            copy.data[i+2] = (b & 0x03) * 85;
            break;
        }
        copy.data[i+3] = 255;
      }
      fCtx.putImageData(copy, 0, 0);
      ctx.drawImage(fullCanvas, 0, 0, thumbW, thumbH);

      results.push({ mode: ch.mode, label: ch.label, color: ch.color, dataUrl: offscreen.toDataURL('image/png') });
    }
    onThumbsGenerated(results);
    // Set initial preview to 'all'
    onChannelPreviewChange('all');
    const allThumb = results.find(t => t.mode === 'all');
    onPreviewUrlChange(allThumb?.dataUrl || null);
  }, [onThumbsGenerated, onChannelPreviewChange, onPreviewUrlChange]);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = async () => {
        const meta = { name: file.name, size: file.size, width: img.width, height: img.height, type: file.type || 'image/png', dataUrl };
        setImageMeta(meta);
        onImageMetaChange({ width: img.width, height: img.height });

        setIsAnalyzing(true);
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);

        const { meanVariance } = await computeVarianceMap(imgData.data, img.width, img.height);
        setVarianceScore(meanVariance);
        setSuitability(meanVariance > 25 ? 'high' : meanVariance > 8 ? 'medium' : 'low');

        generateThumbs(imgData, img.width, img.height);
        setIsAnalyzing(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Clear inspector state when a new tab is activated (reset on unmount from inspector)
  useEffect(() => {
    return () => {
      onImageMetaChange(null);
      onPreviewUrlChange(null);
      onThumbsGenerated([]);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPixels = imageMeta ? imageMeta.width * imageMeta.height : 0;
  const rawCapacityBytes = Math.floor((totalPixels * 6) / 8);
  const rsCapacityBytes = Math.floor(rawCapacityBytes * (191 / 255));

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-900/40 select-none">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            {t.insp_title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.insp_subtitle}</p>
        </div>

        {/* Upload Zone */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-950/60 hover:bg-slate-900 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Select Image for Stego Analysis</span>
          </button>
        </div>

        {imageMeta ? (
          <div className="space-y-4">
            {/* Metrics Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{t.insp_dim}</span>
                <span className="font-mono text-slate-200 font-bold">{imageMeta.width} × {imageMeta.height} px</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{t.insp_pixels}</span>
                <span className="font-mono text-slate-200">{totalPixels.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{t.insp_raw_cap}</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(rawCapacityBytes / 1024).toFixed(1)} KB ({(rawCapacityBytes / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-2">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  {t.insp_rs_cap}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {(rsCapacityBytes / 1024).toFixed(1)} KB ({(rsCapacityBytes / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            </div>

            {/* Texture Variance & Suitability */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{t.insp_variance}</span>
                <span className="font-mono text-slate-200">
                  {isAnalyzing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400 inline" />
                  ) : varianceScore?.toFixed(2) ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{t.insp_suitability}</span>
                {suitability === 'high' && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t.insp_high}
                  </span>
                )}
                {suitability === 'medium' && (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> {t.insp_medium}
                  </span>
                )}
                {suitability === 'low' && (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {t.insp_low}
                  </span>
                )}
              </div>
            </div>

            {/* Hint about right panel */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-start gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                Color channel and LSB noise previews are available in the right panel →
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-600 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
            <Info className="w-6 h-6 mx-auto text-slate-700" />
            <p className="text-xs">Select any image to inspect resolution, channel planes, and payload limits.</p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
