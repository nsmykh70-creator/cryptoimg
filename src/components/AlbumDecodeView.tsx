import React, { useState, useRef } from 'react';
import {
  Layers, UploadCloud, Download, CheckCircle2, RefreshCw,
  AlertTriangle, X, Clock, File
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  deriveMasterKey, deriveSubkeys,
  extractPayloadUnkeyed, extractPayloadShifted,
  parseRsArmored, splitEnvelope,
  aesGcmDecrypt, decompressData, sha256,
  SALT_BYTES, RS_OUTER_HEADER_SIZE, RS_CHUNK_TOTAL,
  COMPRESS_DEFLATE,
  MAGIC, MAGIC_V4,
  ARGON2_DEFAULT_MEMORY, ARGON2_DEFAULT_ITERATIONS, ARGON2_DEFAULT_PARALLELISM,
  ARGON2_BENCHMARK_KEY,
  wipeSecretBuffer,
  isChunkRecord, parseChunkRecord, ChunkInfo,
  validateImageDimensions
} from '../crypto/engine';

interface AlbumDecodeViewProps {
  lang: Language;
}

export const AlbumDecodeView: React.FC<AlbumDecodeViewProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [authMode, setAuthMode] = useState<'pin' | 'passphrase'>('pin');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressStage, setProgressStage] = useState('');

  const [chunks, setChunks] = useState<Record<number, ChunkInfo>>({});
  const [totalChunks, setTotalChunks] = useState(0);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState('');

  const chunkCount = Object.keys(chunks).length;
  const allLoaded = totalChunks > 0 && chunkCount === totalChunks;

  // Decode a single image dataUrl — no global wipeAllSecrets (safe for parallel)
  const decodeOne = async (dataUrl: string, currentPin: string): Promise<ChunkInfo | null> => {
    const localBufs: Uint8Array[] = [];
    const track = (buf: Uint8Array) => { localBufs.push(buf); return buf; };
    const wipeLocal = () => { for (const b of localBufs) wipeSecretBuffer(b); localBufs.length = 0; };

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try { validateImageDimensions(img.width, img.height); } catch (e: any) { reject(e); return; }
          resolve();
        };
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = dataUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // Skip v4 legacy
      const v4Probe = new Uint8Array(4);
      for (let i = 0; i < 4; i++) {
        v4Probe[i] = ((pixelData[i * 4] & 0x0F) << 4) | (pixelData[i * 4 + 1] & 0x0F);
      }
      if (v4Probe[0] === MAGIC_V4[0] && v4Probe[1] === MAGIC_V4[1] &&
          v4Probe[2] === MAGIC_V4[2] && v4Probe[3] === MAGIC_V4[3]) {
        return null;
      }

      const saltProbe = extractPayloadUnkeyed(pixelData, SALT_BYTES);
      let cachedParams: { memory: number; iterations: number; parallelism: number } | null = null;
      try {
        const stored = JSON.parse(localStorage.getItem(ARGON2_BENCHMARK_KEY) || 'null');
        if (stored && stored.params) cachedParams = stored.params;
      } catch {}
      const initialParams = cachedParams || {
        memory: ARGON2_DEFAULT_MEMORY, iterations: ARGON2_DEFAULT_ITERATIONS, parallelism: ARGON2_DEFAULT_PARALLELISM
      };

      let masterKey = track(await deriveMasterKey(currentPin, saltProbe, initialParams));
      let { encKey, stegoKey } = await deriveSubkeys(masterKey);

      const outerHdr = await extractPayloadShifted(pixelData, canvas.width, canvas.height, RS_OUTER_HEADER_SIZE, stegoKey, SALT_BYTES);
      let p = 0;
      for (let i = 0; i < 4; i++) { if (outerHdr[p++] !== MAGIC[i]) throw new Error('NOT_CRYPTOIMG_V5'); }
      const numChunks = (outerHdr[p] << 24) | (outerHdr[p + 1] << 16) | (outerHdr[p + 2] << 8) | outerHdr[p + 3]; p += 4;
      const lastChunkDataLen = outerHdr[p++]; const dataType = outerHdr[p++]; const compressionId = outerHdr[p++]; p++;
      const hdrMem = (outerHdr[p] << 24) | (outerHdr[p + 1] << 16) | (outerHdr[p + 2] << 8) | outerHdr[p + 3]; p += 4;
      const hdrIter = (outerHdr[p] << 24) | (outerHdr[p + 1] << 16) | (outerHdr[p + 2] << 8) | outerHdr[p + 3]; p += 4;
      const hdrPar = outerHdr[p++];
      const hdrParams = { memory: hdrMem, iterations: hdrIter, parallelism: hdrPar };

      if (hdrParams.memory !== initialParams.memory || hdrParams.iterations !== initialParams.iterations || hdrParams.parallelism !== initialParams.parallelism) {
        masterKey = track(await deriveMasterKey(currentPin, saltProbe, hdrParams));
        ({ encKey, stegoKey } = await deriveSubkeys(masterKey));
      }

      const armoredSize = RS_OUTER_HEADER_SIZE + numChunks * RS_CHUNK_TOTAL;
      const fullArmored = await extractPayloadShifted(pixelData, canvas.width, canvas.height, armoredSize, stegoKey, SALT_BYTES);
      const { envelope } = parseRsArmored(fullArmored);
      const parts = splitEnvelope(envelope);

      let plainCompressed = track(await aesGcmDecrypt(encKey, parts.ciphertext, parts.tag, parts.nonce, parts.aad));
      let plainBytes = plainCompressed;
      if (parts.header.compressionId === COMPRESS_DEFLATE) {
        plainBytes = track(await decompressData(plainCompressed));
      }

      if (dataType === 2 && isChunkRecord(plainBytes)) {
        const result = parseChunkRecord(plainBytes);
        wipeLocal();
        return result;
      }
      wipeLocal();
      return null;
    } catch {
      wipeLocal();
      return null;
    }
  };

  // Handle multi-file selection — first file sequential, rest parallel
  const handleFiles = async (fileList: FileList) => {
    if (authMode === 'pin') {
      if (!pin || pin.length < 8 || pin.length > 11 || !/^\d+$/.test(pin)) {
        alert(t.err_pin_len);
        return;
      }
    } else {
      if (pin.length < 12) {
        alert('Passphrase must be at least 12 characters');
        return;
      }
      if (pin !== pinConfirm) {
        alert('Passphrases do not match');
        return;
      }
    }

    const files: File[] = Array.from(fileList);
    setIsProcessing(true);
    setProgressPct(0);
    setError('');

    // Read all files into dataUrls first (fast, parallel I/O)
    setProgressStage('Reading files...');
    const dataUrls = await Promise.all(files.map((file) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      })
    ));

    // Decode first file to get Argon2 params + totalChunks info
    setProgressStage('Deriving key (Argon2id)...');
    setProgressPct(5);
    const firstResult = await decodeOne(dataUrls[0], pin);
    if (!firstResult) {
      setError('First file is not an album chunk image.');
      setIsProcessing(false);
      return;
    }

    const newChunks: Record<number, ChunkInfo> = { [firstResult.chunkIndex]: firstResult };
    const detectedTotal = firstResult.totalChunks;
    setTotalChunks(detectedTotal);
    setFileName(firstResult.fileName);
    setFileSize(firstResult.fileSize);
    setChunks({ ...newChunks });
    setProgressPct(Math.round((1 / files.length) * 100));
    setProgressStage(`Key ready. Decoding ${files.length - 1} remaining images in parallel...`);

    // Decode remaining sequentially (batch of 2) to prevent memory exhaustion on mobile
    if (dataUrls.length > 1) {
      const remaining = dataUrls.slice(1);
      let doneCount = 1;
      let skipped = 0;
      const BATCH_SIZE = 2;

      for (let b = 0; b < remaining.length; b += BATCH_SIZE) {
        const batch = remaining.slice(b, b + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((dataUrl) =>
            decodeOne(dataUrl, pin).then((result) => {
              doneCount++;
              setProgressPct(Math.round((doneCount / files.length) * 100));
              setProgressStage(`Decoded ${doneCount}/${files.length}...`);
              return result;
            })
          )
        );

        for (const r of results) {
          if (r.status === 'fulfilled' && r.value) {
            newChunks[r.value.chunkIndex] = r.value;
          } else {
            skipped++;
          }
        }
      }

      setChunks({ ...newChunks });
      setProgressPct(100);

      const decoded = Object.keys(newChunks).length;
      if (skipped > 0 && decoded === 0) {
        setError(`None of the ${files.length} files are album chunk images.`);
      } else if (skipped > 0) {
        setProgressStage(`${decoded} decoded, ${skipped} skipped ✓`);
      } else {
        setProgressStage(`All ${decoded} chunks decoded ✓`);
      }
    } else {
      setProgressPct(100);
      setProgressStage('1/1 decoded ✓');
    }

    setIsProcessing(false);
  };

  // Assemble and download
  const handleAssemble = async () => {
    const chunkValues: ChunkInfo[] = Object.values(chunks) as ChunkInfo[];
    const sorted = chunkValues.sort((a, b) => a.chunkIndex - b.chunkIndex);
    const totalSize = sorted.reduce((sum, c) => sum + c.chunkData.length, 0);
    const assembled = new Uint8Array(totalSize);
    let off = 0;
    for (const chunk of sorted) {
      assembled.set(chunk.chunkData, off);
      off += chunk.chunkData.length;
    }

    // SHA-256 verify
    const calcSha = await sha256(assembled);
    const expectedSha = sorted[0].fileSha256;
    const shaOk = calcSha.length === expectedSha.length && calcSha.every((v, i) => v === expectedSha[i]);
    if (!shaOk) throw new Error('SHA_MISMATCH');

    const blob = new Blob([assembled]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'extracted-file.bin';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const removeChunk = (idx: number) => {
    setChunks((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-slate-900/40 select-none">
      {/* Left: Input */}
      <div className="w-full md:w-[480px] flex-shrink-0 border-r border-slate-800/80 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            {t.album_mode || 'Album Extract'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Select all chunk images at once to extract the hidden file</p>
        </div>

        {/* Auth Mode: PIN or Passphrase */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">{t.dec_step2_pin}</label>
            <div className="flex items-center gap-1 bg-slate-950/80 rounded-lg border border-slate-800 p-0.5">
              <button type="button" onClick={() => { setAuthMode('pin'); setPin(''); setPinConfirm(''); }}
                className={`px-2 py-0.5 text-[10px] rounded-md font-medium transition-all cursor-pointer ${authMode === 'pin' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'}`}>
                PIN (Quick)
              </button>
              <button type="button" onClick={() => { setAuthMode('passphrase'); setPin(''); setPinConfirm(''); }}
                className={`px-2 py-0.5 text-[10px] rounded-md font-medium transition-all cursor-pointer ${authMode === 'passphrase' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-500 hover:text-slate-300'}`}>
                Passphrase (Secure)
              </button>
            </div>
          </div>

          {authMode === 'pin' ? (
            <>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder={t.dec_pin_placeholder}
                  maxLength={11}
                  inputMode="numeric"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono outline-none pr-8"
                />
                <button onClick={() => setShowPin(!showPin)} className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer">
                  {showPin ? '🙈' : '👁'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter passphrase (12+ characters)"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono outline-none pr-8"
                  />
                  <button onClick={() => setShowPin(!showPin)} className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer">
                    {showPin ? '🙈' : '👁'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPinConfirm ? 'text' : 'password'}
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value)}
                    placeholder="Confirm passphrase"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono outline-none pr-8"
                  />
                  <button onClick={() => setShowPinConfirm(!showPinConfirm)} className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer">
                    {showPinConfirm ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              {pin.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pin.length >= 20 ? 'bg-emerald-500 w-full' : pin.length >= 16 ? 'bg-green-500 w-3/4' : pin.length >= 12 ? 'bg-amber-500 w-1/2' : 'bg-red-500 w-1/4'}`} />
                  </div>
                  <span className="text-[9px] text-slate-500 w-16 text-right">
                    {pin.length >= 20 ? 'Strong' : pin.length >= 16 ? 'Good' : pin.length >= 12 ? 'Fair' : 'Too short'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Multi-file picker */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept="image/*"
          multiple
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || !pin}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            isProcessing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg cursor-pointer'
          }`}
        >
          {isProcessing ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /><span>{progressStage}</span></>
          ) : (
            <><UploadCloud className="w-4 h-4" /><span>Select Album Images ({totalChunks ? `${chunkCount}/${totalChunks}` : 'all at once'})</span></>
          )}
        </button>

        {isProcessing && (
          <div className="space-y-1 p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{progressStage}</span><span>{progressPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />{error}
          </div>
        )}

        {/* Chunk dots */}
        {totalChunks > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Chunks: {chunkCount} / {totalChunks}</span>
              <span>{fileName} ({(fileSize / 1024).toFixed(1)} KB)</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: totalChunks }, (_, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold border ${
                    chunks[i] ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {chunks[i] ? '✓' : (i + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Results */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        {allLoaded ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
            <div className="text-center">
              <p className="text-sm font-bold text-emerald-400">
                {t.album_assembled?.replace('{count}', String(totalChunks)) || `All ${totalChunks} chunks loaded`}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                <File className="w-3.5 h-3.5 inline mr-1" />
                {fileName} · {(fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={handleAssemble}
              className="w-full max-w-sm py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <Download className="w-5 h-5" />
              Download {fileName}
            </button>
          </div>
        ) : chunkCount > 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <div className="text-amber-400 text-4xl font-bold">{chunkCount}/{totalChunks}</div>
            <p className="text-xs text-slate-400">
              {totalChunks - chunkCount} more chunk(s) needed. Click the button above to select more images.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-600 space-y-2">
            <Layers className="w-10 h-10 text-slate-700" />
            <p className="text-xs font-medium">Enter PIN, then select all album chunk images</p>
            <p className="text-[10px] text-slate-600 max-w-xs">
              The app will decode all images, verify chunks, and assemble the original file
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
