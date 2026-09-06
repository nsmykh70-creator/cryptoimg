import React, { useState, useRef } from 'react';
import {
  Layers, UploadCloud, FileCheck, Lock, Download, X, CheckCircle2,
  RefreshCw, AlertTriangle, FolderOpen, Package
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Argon2Params, ImageMeta, Language
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  deriveMasterKey, deriveSubkeys, compressData, aesGcmEncrypt,
  buildAadHeader, assembleEnvelope, buildRsArmored, embedPayloadWithSalt,
  extractPayloadUnkeyed, extractPayloadShifted, parseRsArmored, splitEnvelope,
  aesGcmDecrypt, decompressData, sha256, utf8ToBytes, randomBytes,
  SALT_BYTES, COMPRESS_DEFLATE, DATA_TYPE_CHUNK,
  sleep, trackSecretBuffer, wipeAllSecrets,
  estimateUsableCapacity, buildChunkRecord, isChunkRecord, parseChunkRecord,
  validateImageDimensions
} from '../crypto/engine';

interface AlbumEncodeViewProps {
  lang: Language;
  argon2Params: Argon2Params;
}

interface CarrierImage extends ImageMeta {
  usableCapacity: number; // estimated usable bytes
}

export const AlbumEncodeView: React.FC<AlbumEncodeViewProps> = ({ lang, argon2Params }) => {
  const t = TRANSLATIONS[lang];

  const [carrierImages, setCarrierImages] = useState<CarrierImage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);

  const [authMode, setAuthMode] = useState<'pin' | 'passphrase'>('pin');
  const [pin, setPin] = useState<string>('');
  const [pinConfirm, setPinConfirm] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showPinConfirm, setShowPinConfirm] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');

  const [resultBlobs, setResultBlobs] = useState<{ blob: Blob; name: string }[]>([]);
  const [albumComplete, setAlbumComplete] = useState<boolean>(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const totalCapacity = carrierImages.reduce((sum, img) => sum + img.usableCapacity, 0);
  const fileSize = fileBuffer?.byteLength || 0;
  const fitsInAlbum = fileSize > 0 && fileSize <= totalCapacity;

  // Calculate how many images are actually needed
  const getNeededImageCount = (): number => {
    if (!fileBuffer || carrierImages.length === 0) return 0;
    let needed = 0;
    let remaining = fileSize;
    for (const img of carrierImages) {
      if (remaining <= 0) break;
      remaining -= Math.max(0, img.usableCapacity - 100);
      needed++;
    }
    return needed;
  };
  const neededImages = getNeededImageCount();

  // Load carrier images
  const handleImageFiles = (files: FileList) => {
    const newImages: CarrierImage[] = [];
    let loaded = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          try { validateImageDimensions(img.width, img.height); } catch (e: any) { alert(e.message); return; }
          const usable = estimateUsableCapacity(img.width, img.height);
          newImages.push({
            name: file.name,
            size: file.size,
            width: img.width,
            height: img.height,
            type: file.type || 'image/png',
            dataUrl,
            usableCapacity: usable
          });
          loaded++;
          if (loaded === files.length) {
            setCarrierImages((prev) => [...prev, ...newImages]);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Load binary file
  const handleBinaryFile = (file: File) => {
    if (file.size > 200 * 1024 * 1024) {
      alert('Max 200 MB for album mode');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setFileBuffer(e.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  };

  const removeImage = (index: number) => {
    setCarrierImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Main encode: split file into chunks and encode each into a carrier image
  const handleEncode = async () => {
    if (carrierImages.length < 2) {
      alert('Album mode requires at least 2 carrier images');
      return;
    }
    if (!selectedFile || !fileBuffer) {
      alert(t.err_no_file);
      return;
    }
    if (authMode === 'pin') {
      if (pin.length < 8 || pin.length > 11 || !/^\d+$/.test(pin)) {
        alert(t.err_pin_len);
        return;
      }
    } else {
      if (pin.length < 12) {
        alert('Passphrase must be at least 12 characters');
        return;
      }
    }
    if (pin !== pinConfirm) {
      alert(t.err_pin_match);
      return;
    }
    if (!fitsInAlbum) {
      const totalKB = (totalCapacity / 1024).toFixed(0);
      const fileKB = (fileSize / 1024).toFixed(0);
      alert(`File (${fileKB} KB) exceeds album capacity (${totalKB} KB). Add more images.`);
      return;
    }

    setIsProcessing(true);
    setAlbumComplete(false);
    setResultBlobs([]);
    setSelfTestSummary(null);

    try {
      const fileBytes = trackSecretBuffer(new Uint8Array(fileBuffer));
      const fileSha = trackSecretBuffer(await sha256(fileBytes));

      // Only create chunks that have data — skip empty images
      const chunks: { index: number; data: Uint8Array; carrierIdx: number }[] = [];
      let offset = 0;
      let chunkIdx = 0;
      for (let i = 0; i < carrierImages.length && offset < fileBytes.length; i++) {
        const imgCapacity = carrierImages[i].usableCapacity;
        const chunkSize = Math.min(imgCapacity - 100, fileBytes.length - offset);
        if (chunkSize <= 0) continue;
        chunks.push({ index: chunkIdx++, data: fileBytes.subarray(offset, offset + chunkSize), carrierIdx: i });
        offset += chunkSize;
      }
      const totalChunks = chunks.length;
      if (totalChunks === 0) throw new Error('No data to encode');

      const results: { blob: Blob; name: string }[] = [];

      for (let i = 0; i < totalChunks; i++) {
        setProgressPct(Math.round((i / totalChunks) * 90));
        setProgressStage(t.album_encoding?.replace('{current}', String(i + 1)).replace('{total}', String(totalChunks)) || `Part ${i + 1}/${totalChunks}`);

        const chunkRecord = buildChunkRecord({
          chunkIndex: chunks[i].index,
          totalChunks,
          fileName: selectedFile.name,
          fileSize: fileBytes.length,
          fileSha256: fileSha,
          chunkData: chunks[i].data
        });

        // Standard v5.1 encode pipeline per chunk
        const salt = trackSecretBuffer(randomBytes(SALT_BYTES));
        const masterKey = trackSecretBuffer(await deriveMasterKey(pin, salt, argon2Params));
        const { encKey, stegoKey } = await deriveSubkeys(masterKey);

        const { data: compressed, compressed: isCompressed } = await compressData(chunkRecord);
        const compressionId = isCompressed ? COMPRESS_DEFLATE : 0;

        const nonce = trackSecretBuffer(randomBytes(12));
        const aadHeader = buildAadHeader(DATA_TYPE_CHUNK, compressionId, compressed.length, argon2Params);
        const { ciphertext, tag } = await aesGcmEncrypt(encKey, compressed, nonce, aadHeader);
        const envelope = assembleEnvelope(aadHeader, salt, nonce, ciphertext, tag);
        const armored = buildRsArmored(envelope, DATA_TYPE_CHUNK, compressionId, argon2Params);

        // Draw carrier image
        const carrier = carrierImages[chunks[i].carrierIdx];
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image load error'));
          img.src = carrier.dataUrl!;
        });

        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const embedResult = await embedPayloadWithSalt(
          imgData.data, canvas.width, canvas.height, salt, armored, stegoKey
        );
        if (!embedResult.ok) {
          alert(`Image "${carrier.name}" too small for its chunk. Use larger images or add more.`);
          setIsProcessing(false);
          return;
        }
        ctx.putImageData(imgData, 0, 0);

        // Quick self-test
        const testSalt = extractPayloadUnkeyed(imgData.data, SALT_BYTES);
        const testArmored = await extractPayloadShifted(
          imgData.data, canvas.width, canvas.height, armored.length, stegoKey, SALT_BYTES
        );
        const { envelope: envBack } = parseRsArmored(testArmored);
        const parts = splitEnvelope(envBack);
        const mk2 = trackSecretBuffer(await deriveMasterKey(pin, parts.salt, argon2Params));
        const { encKey: ek2 } = await deriveSubkeys(mk2);
        const decrypted = trackSecretBuffer(await aesGcmDecrypt(ek2, parts.ciphertext, parts.tag, parts.nonce, parts.aad));
        let decompressed = decrypted;
        if (parts.header.compressionId === COMPRESS_DEFLATE) {
          decompressed = trackSecretBuffer(await decompressData(decrypted));
        }
        const backSha = await sha256(decompressed);
        const origSha = await sha256(chunkRecord);
        const match = origSha.length === backSha.length && origSha.every((v, j) => v === backSha[j]);
        if (!match) throw new Error(`Self-test failed for chunk ${chunks[i].index + 1}`);

        // Export as PNG
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png', 1.0);
        });
        results.push({ blob, name: `cryptoimg-chunk-${chunks[i].index + 1}-${selectedFile.name}.png` });

        wipeAllSecrets();
      }

      setResultBlobs(results);
      setAlbumComplete(true);
      setProgressPct(100);
      setProgressStage('Done ✓');

      confetti({ particleCount: 80, spread: 80, origin: { y: 0.8 }, colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24'] });
    } catch (err: any) {
      console.error(err);
      alert('Album encode error: ' + (err.message || 'Unknown'));
    } finally {
      wipeAllSecrets();
      setIsProcessing(false);
    }
  };

  const [selfTestSummary, setSelfTestSummary] = useState<{ pass: boolean; text: string } | null>(null);

  const downloadAll = () => {
    for (const { blob, name } of resultBlobs) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          {t.album_mode || 'Album Mode'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{t.album_desc || 'Split a large file across multiple carrier images'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Inputs */}
        <div className="space-y-4">
          {/* 1. Carrier Images */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {t.album_add_images || 'Carrier Images (min 2)'}
            </label>
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700/80 hover:border-amber-500/60 bg-slate-950/40 hover:bg-slate-950/70 p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <FolderOpen className="w-6 h-6 text-slate-400 group-hover:text-amber-400 mb-1" />
              <p className="text-xs font-semibold text-slate-300">{t.album_add_images || 'Click to select multiple images'}</p>
            </div>

            {/* Selected images list */}
            {carrierImages.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {carrierImages.map((img, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                    <img src={img.dataUrl} alt="" className="w-8 h-8 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 truncate font-semibold">{img.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{img.width}×{img.height} · ~{(img.usableCapacity / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => removeImage(i)} className="text-slate-500 hover:text-rose-400 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}

            {carrierImages.length > 0 && (
              <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                <span>{carrierImages.length} images · {(totalCapacity / 1024).toFixed(0)} KB total{fileBuffer && neededImages > 0 ? ` → ${neededImages} used` : ''}</span>
              </div>
            )}
          </div>

          {/* 2. File */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">File to split</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleBinaryFile(e.target.files[0])}
              className="hidden"
            />
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-950/40 hover:bg-slate-950/70 p-4 rounded-xl flex items-center justify-center gap-2.5 text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
              >
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs">Select file (any size up to 200 MB)</span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedFile(null); setFileBuffer(null); }} className="text-slate-400 hover:text-rose-400 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
            )}
            {fileBuffer && totalCapacity > 0 && (
              <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${fitsInAlbum ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300' : 'bg-rose-950/40 border border-rose-800/50 text-rose-300'}`}>
                {fitsInAlbum ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>
                  {fitsInAlbum
                    ? `File (${(fileSize / 1024).toFixed(0)} KB) → ${neededImages} of ${carrierImages.length} images needed (${(totalCapacity / 1024).toFixed(0)} KB total)`
                    : `File (${(fileSize / 1024).toFixed(0)} KB) exceeds capacity (${(totalCapacity / 1024).toFixed(0)} KB). Add ${Math.ceil((fileSize - totalCapacity) / (totalCapacity / carrierImages.length))}+ more images.`
                  }
                </span>
              </div>
            )}
          </div>

          {/* 3. Secret Key — PIN or Passphrase */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">{t.enc_step3_pin}</label>
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
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input type={showPin ? 'text' : 'password'} value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder={t.pin1_placeholder} maxLength={11} inputMode="numeric"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none pr-8" />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 cursor-pointer text-xs">{showPin ? '🙈' : '👁'}</button>
                </div>
                <div className="relative">
                  <input type={showPinConfirm ? 'text' : 'password'} value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder={t.pin2_placeholder} maxLength={11} inputMode="numeric"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none pr-8" />
                  <button type="button" onClick={() => setShowPinConfirm(!showPinConfirm)} className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 cursor-pointer text-xs">{showPinConfirm ? '🙈' : '👁'}</button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="relative">
                  <input type={showPin ? 'text' : 'password'} value={pin}
                    onChange={(e) => setPin(e.target.value)} placeholder="Enter passphrase (12+ characters)"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none pr-8" />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 cursor-pointer text-xs">{showPin ? '🙈' : '👁'}</button>
                </div>
                <div className="relative">
                  <input type={showPinConfirm ? 'text' : 'password'} value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value)} placeholder="Confirm passphrase"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none pr-8" />
                  <button type="button" onClick={() => setShowPinConfirm(!showPinConfirm)} className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 cursor-pointer text-xs">{showPinConfirm ? '🙈' : '👁'}</button>
                </div>
              </div>
            )}
          </div>

          {/* Encode Button */}
          <button
            onClick={handleEncode}
            disabled={isProcessing || carrierImages.length < 2 || !fileBuffer}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isProcessing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /><span>{progressStage}</span></>
            ) : (
              <><Lock className="w-4 h-4" /><span>Encrypt & Split into {neededImages || carrierImages.length || '?'} Images</span></>
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

          {albumComplete && resultBlobs.length > 0 && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
              <p className="text-xs font-bold text-emerald-400 text-center">{resultBlobs.length} images ready</p>
              <button
                onClick={downloadAll}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download All {resultBlobs.length} Images
              </button>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <canvas ref={canvasRef} className="hidden" />

          {albumComplete && resultBlobs.length > 0 ? (
            <div className="text-center space-y-4 w-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-emerald-400">
                {t.album_ready?.replace('{count}', String(resultBlobs.length)) || `${resultBlobs.length} images ready`}
              </p>
              <p className="text-xs text-slate-400">
                {t.album_assembled?.replace('{count}', String(resultBlobs.length)) || `Assembled from ${resultBlobs.length} parts`}
              </p>
              <button
                onClick={downloadAll}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download All {resultBlobs.length} Images
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-600 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-700" />
              <p className="text-xs">Encrypted album images will appear here</p>
              <p className="text-[10px] text-slate-600">
                Load {carrierImages.length || '?'}+ carrier images and a file, then encrypt
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
