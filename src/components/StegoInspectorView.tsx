import React, { useState, useRef } from 'react';
import { 
  BarChart3, 
  UploadCloud, 
  Layers, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  RefreshCw
} from 'lucide-react';
import { ImageMeta, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { computeVarianceMap } from '../crypto/engine';

interface StegoInspectorViewProps {
  lang: Language;
}

export const StegoInspectorView: React.FC<StegoInspectorViewProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [varianceScore, setVarianceScore] = useState<number | null>(null);
  const [suitability, setSuitability] = useState<'high' | 'medium' | 'low' | null>(null);
  const [channelPreview, setChannelPreview] = useState<'all' | 'r' | 'g' | 'b' | 'lsb'>('all');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawImageRef = useRef<HTMLImageElement | null>(null);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = async () => {
        rawImageRef.current = img;
        setImageMeta({
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height,
          type: file.type || 'image/png',
          dataUrl
        });

        // Run texture analysis
        setIsAnalyzing(true);
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const { meanVariance } = await computeVarianceMap(imgData.data, img.width, img.height);

        setVarianceScore(meanVariance);
        if (meanVariance > 25) {
          setSuitability('high');
        } else if (meanVariance > 8) {
          setSuitability('medium');
        } else {
          setSuitability('low');
        }

        renderChannel(imgData, 'all');
        setIsAnalyzing(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const renderChannel = (imgData: ImageData, mode: 'all' | 'r' | 'g' | 'b' | 'lsb') => {
    if (!canvasRef.current || !rawImageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const copy = ctx.createImageData(canvas.width, canvas.height);

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];

      if (mode === 'all') {
        copy.data[i] = r;
        copy.data[i + 1] = g;
        copy.data[i + 2] = b;
        copy.data[i + 3] = 255;
      } else if (mode === 'r') {
        copy.data[i] = r;
        copy.data[i + 1] = 0;
        copy.data[i + 2] = 0;
        copy.data[i + 3] = 255;
      } else if (mode === 'g') {
        copy.data[i] = 0;
        copy.data[i + 1] = g;
        copy.data[i + 2] = 0;
        copy.data[i + 3] = 255;
      } else if (mode === 'b') {
        copy.data[i] = 0;
        copy.data[i + 1] = 0;
        copy.data[i + 2] = b;
        copy.data[i + 3] = 255;
      } else if (mode === 'lsb') {
        // Amplify 2-LSBs to full brightness for visual noise inspection
        const rLsb = (r & 0x03) * 85;
        const gLsb = (g & 0x03) * 85;
        const bLsb = (b & 0x03) * 85;
        copy.data[i] = rLsb;
        copy.data[i + 1] = gLsb;
        copy.data[i + 2] = bLsb;
        copy.data[i + 3] = 255;
      }
    }
    ctx.putImageData(copy, 0, 0);
  };

  const handleChannelSwitch = (mode: 'all' | 'r' | 'g' | 'b' | 'lsb') => {
    setChannelPreview(mode);
    if (canvasRef.current && rawImageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(rawImageRef.current, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      renderChannel(imgData, mode);
    }
  };

  const totalPixels = imageMeta ? imageMeta.width * imageMeta.height : 0;
  const rawCapacityBytes = Math.floor((totalPixels * 6) / 8);
  const rsCapacityBytes = Math.floor(rawCapacityBytes * (191 / 255));

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-slate-900/40 select-none">
      {/* Left Column: Diagnostics & Carrier Details */}
      <div className="w-full md:w-[460px] lg:w-[480px] flex-shrink-0 border-r border-slate-800/80 flex flex-col h-full overflow-y-auto p-4 space-y-4">
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

        {/* Metrics Card */}
        {imageMeta ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{t.insp_dim}</span>
                <span className="font-mono text-slate-200 font-bold">
                  {imageMeta.width} × {imageMeta.height} px
                </span>
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

            {/* Texture Variance & Stego Suitability */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{t.insp_variance}</span>
                <span className="font-mono text-slate-200">
                  {isAnalyzing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400 inline" />
                  ) : (
                    varianceScore?.toFixed(2) ?? '—'
                  )}
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

            {/* Bit Plane Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Color Plane & LSB Noise Inspector
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-xs font-mono">
                {[
                  { id: 'all', label: 'RGB' },
                  { id: 'r', label: 'Red' },
                  { id: 'g', label: 'Green' },
                  { id: 'b', label: 'Blue' },
                  { id: 'lsb', label: '2-LSB' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleChannelSwitch(item.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-center font-bold border transition-all cursor-pointer ${
                      channelPreview === item.id
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-600 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
            <Info className="w-6 h-6 mx-auto text-slate-700" />
            <p className="text-xs">Select any image to inspect resolution, channel planes, and payload limits.</p>
          </div>
        )}
      </div>

      {/* Right Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full h-full flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden relative">
          <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-slate-800" />
          {!imageMeta && (
            <p className="text-xs text-slate-600">Image visualizer canvas</p>
          )}
        </div>
      </div>
    </div>
  );
};
