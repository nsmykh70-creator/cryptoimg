import React, { useState, useRef } from 'react';
import { 
  Unlock, 
  UploadCloud, 
  Eye, 
  EyeOff, 
  Copy, 
  Download, 
  FileCheck2, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  File, 
  X,
  ShieldAlert,
  Clock,
  Layers
} from 'lucide-react';
import { DecodedResult, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  deriveMasterKey, 
  deriveSubkeys, 
  extractPayloadUnkeyed, 
  extractPayloadShifted, 
  parseRsArmored, 
  splitEnvelope, 
  aesGcmDecrypt, 
  decompressData, 
  sha256, 
  bytesToUtf8, 
  SALT_BYTES, 
  RS_OUTER_HEADER_SIZE, 
  RS_CHUNK_DATA, 
  RS_CHUNK_TOTAL, 
  COMPRESS_DEFLATE, 
  DATA_TYPE_TEXT, 
  DATA_TYPE_FILE, 
  MAGIC, 
  MAGIC_V4, 
  decodeV4Legacy,  ARGON2_DEFAULT_MEMORY,
  ARGON2_DEFAULT_ITERATIONS,
  ARGON2_DEFAULT_PARALLELISM,
  ARGON2_BENCHMARK_KEY,
  trackSecretBuffer,
  wipeAllSecrets,
  DATA_TYPE_CHUNK,
  isChunkRecord,
  parseChunkRecord,
  ChunkInfo,
  validateImageDimensions
} from '../crypto/engine';

interface DecodeViewProps {
  lang: Language;
}

export const DecodeView: React.FC<DecodeViewProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const [keyImageFile, setKeyImageFile] = useState<File | null>(null);
  const [keyImageDataUrl, setKeyImageDataUrl] = useState<string | null>(null);

  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');

  const [result, setResult] = useState<DecodedResult | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [clipboardTimerSeconds, setClipboardTimerSeconds] = useState<number | null>(null);

  // Album mode state
  const [isAlbumMode, setIsAlbumMode] = useState<boolean>(false);
  const [albumChunks, setAlbumChunks] = useState<Record<number, ChunkInfo>>({});
  const [albumFileName, setAlbumFileName] = useState<string>('');
  const [albumFileSize, setAlbumFileSize] = useState<number>(0);
  const [albumTotalChunks, setAlbumTotalChunks] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const handleKeyFile = (file: File) => {
    setKeyImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setKeyImageDataUrl(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Decode a single image from dataUrl, returns chunk info or null
  const decodeImageFromDataUrl = async (
    dataUrl: string,
    currentPin: string
  ): Promise<ChunkInfo | null> => {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try { validateImageDimensions(img.width, img.height); } catch (e: any) { reject(e); return; }
        resolve();
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = dataUrl;
    });

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);
    const pixelData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

    // Probe for v4 legacy
    const v4Probe = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
      v4Probe[i] = ((pixelData[i * 4] & 0x0F) << 4) | (pixelData[i * 4 + 1] & 0x0F);
    }
    if (v4Probe[0] === MAGIC_V4[0] && v4Probe[1] === MAGIC_V4[1] &&
        v4Probe[2] === MAGIC_V4[2] && v4Probe[3] === MAGIC_V4[3]) {
      return null; // v4 legacy — not a chunk
    }

    // v5.1 extraction
    const saltProbe = extractPayloadUnkeyed(pixelData, SALT_BYTES);
    let cachedParams: { memory: number; iterations: number; parallelism: number } | null = null;
    try {
      const stored = JSON.parse(localStorage.getItem(ARGON2_BENCHMARK_KEY) || 'null');
      if (stored && stored.params) cachedParams = stored.params;
    } catch { /* ignore */ }
    const initialParams = cachedParams || {
      memory: ARGON2_DEFAULT_MEMORY,
      iterations: ARGON2_DEFAULT_ITERATIONS,
      parallelism: ARGON2_DEFAULT_PARALLELISM
    };
    let masterKey = trackSecretBuffer(await deriveMasterKey(currentPin, saltProbe, initialParams));
    let { encKey, stegoKey } = await deriveSubkeys(masterKey);

    const outerHdr = await extractPayloadShifted(
      pixelData, tempCanvas.width, tempCanvas.height,
      RS_OUTER_HEADER_SIZE, stegoKey, SALT_BYTES
    );
    let p = 0;
    for (let i = 0; i < 4; i++) {
      if (outerHdr[p++] !== MAGIC[i]) throw new Error('NOT_CRYPTOIMG_V5');
    }
    const numChunks = (outerHdr[p] << 24) | (outerHdr[p + 1] << 16) | (outerHdr[p + 2] << 8) | outerHdr[p + 3]; p += 4;
    const lastChunkDataLen = outerHdr[p++];
    const dataType = outerHdr[p++];
    const compressionId = outerHdr[p++];
    p++;
    const hdrArgon2Memory = (outerHdr[p] << 24) | (outerHdr[p + 1] << 16) | (outerHdr[p + 2] << 8) | outerHdr[p + 3]; p += 4;
    const hdrArgon2Iterations = (outerHdr[p] << 24) | (outerHdr[p + 1] << 16) | (outerHdr[p + 2] << 8) | outerHdr[p + 3]; p += 4;
    const hdrArgon2Parallelism = outerHdr[p++];
    const argon2Params = { memory: hdrArgon2Memory, iterations: hdrArgon2Iterations, parallelism: hdrArgon2Parallelism };

    if (argon2Params.memory !== initialParams.memory || argon2Params.iterations !== initialParams.iterations || argon2Params.parallelism !== initialParams.parallelism) {
      masterKey = trackSecretBuffer(await deriveMasterKey(currentPin, saltProbe, argon2Params));
      ({ encKey, stegoKey } = await deriveSubkeys(masterKey));
    }

    const armoredSize = RS_OUTER_HEADER_SIZE + numChunks * RS_CHUNK_TOTAL;
    const fullArmored = await extractPayloadShifted(
      pixelData, tempCanvas.width, tempCanvas.height,
      armoredSize, stegoKey, SALT_BYTES
    );
    const { envelope } = parseRsArmored(fullArmored);
    const parts = splitEnvelope(envelope);

    let plainCompressed = trackSecretBuffer(await aesGcmDecrypt(encKey, parts.ciphertext, parts.tag, parts.nonce, parts.aad));
    let plainBytes = plainCompressed;
    if (parts.header.compressionId === COMPRESS_DEFLATE) {
      plainBytes = trackSecretBuffer(await decompressData(plainCompressed));
    }

    // Must check BEFORE wipeAllSecrets — it zeros tracked buffers
    let result: ChunkInfo | null = null;
    if (dataType === DATA_TYPE_CHUNK && isChunkRecord(plainBytes)) {
      result = parseChunkRecord(plainBytes);
    }

    wipeAllSecrets();
    return result;
  };

  const handleDecode = async () => {
    if (!keyImageFile || !keyImageDataUrl) {
      alert(t.err_no_img);
      return;
    }
    if (pin.length < 8 || pin.length > 11 || !/^\d+$/.test(pin)) {
      alert(t.err_pin_len);
      return;
    }

    setIsProcessing(true);
    setProgressPct(10);
    setProgressStage('Loading photo-key canvas...');
    setResult(null);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = keyImageDataUrl;
      });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const pixelData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

      // Probe for v4 legacy container
      const v4Probe = new Uint8Array(4);
      for (let i = 0; i < 4; i++) {
        v4Probe[i] = ((pixelData[i * 4] & 0x0F) << 4) | (pixelData[i * 4 + 1] & 0x0F);
      }
      const isV4 = (v4Probe[0] === MAGIC_V4[0] && v4Probe[1] === MAGIC_V4[1] &&
                    v4Probe[2] === MAGIC_V4[2] && v4Probe[3] === MAGIC_V4[3]);

      if (isV4) {
        setProgressPct(50);
        setProgressStage('Decoding Legacy v4.0 Container...');
        const v4Decoded = await decodeV4Legacy(pixelData, pin);
        setProgressPct(100);
        setProgressStage('Decryption Successful ✓');
        setResult(v4Decoded);
        setPin('');
        return;
      }

      // v5.1 Protocol Extraction
      setProgressPct(20);
      setProgressStage('Extracting salt and probing outer header...');
      const saltProbe = extractPayloadUnkeyed(pixelData, SALT_BYTES);

      // Use cached benchmark params (like the web version) so files encoded
      // on devices with different Argon2 benchmarks can be decoded here.
      let cachedParams: { memory: number; iterations: number; parallelism: number } | null = null;
      try {
        const stored = JSON.parse(localStorage.getItem(ARGON2_BENCHMARK_KEY) || 'null');
        if (stored && stored.params) cachedParams = stored.params;
      } catch { /* ignore */ }
      const initialParams = cachedParams || {
        memory: ARGON2_DEFAULT_MEMORY,
        iterations: ARGON2_DEFAULT_ITERATIONS,
        parallelism: ARGON2_DEFAULT_PARALLELISM
      };

      let masterKey = trackSecretBuffer(await deriveMasterKey(pin, saltProbe, initialParams));
      let { encKey, stegoKey } = await deriveSubkeys(masterKey);

      setProgressPct(40);
      setProgressStage('Reading outer Reed-Solomon header...');
      const outerHdr = await extractPayloadShifted(
        pixelData,
        tempCanvas.width,
        tempCanvas.height,
        RS_OUTER_HEADER_SIZE,
        stegoKey,
        SALT_BYTES
      );

      let p = 0;
      for (let i = 0; i < 4; i++) {
        if (outerHdr[p++] !== MAGIC[i]) throw new Error('NOT_CRYPTOIMG_V5');
      }
      const numChunks = (outerHdr[p] << 24) | (outerHdr[p + 1] << 16) | (outerHdr[p + 2] << 8) | outerHdr[p + 3]; p += 4;
      const lastChunkDataLen = outerHdr[p++];
      const dataType = outerHdr[p++];
      const compressionId = outerHdr[p++];
      p++; // reserved
      const hdrArgon2Memory = (outerHdr[p] << 24) | (outerHdr[p + 1] << 16) | (outerHdr[p + 2] << 8) | outerHdr[p + 3]; p += 4;
      const hdrArgon2Iterations = (outerHdr[p] << 24) | (outerHdr[p + 1] << 16) | (outerHdr[p + 2] << 8) | outerHdr[p + 3]; p += 4;
      const hdrArgon2Parallelism = outerHdr[p++];

      const argon2Params = { memory: hdrArgon2Memory, iterations: hdrArgon2Iterations, parallelism: hdrArgon2Parallelism };

      // Re-derive if params differ
      if (
        argon2Params.memory !== initialParams.memory ||
        argon2Params.iterations !== initialParams.iterations ||
        argon2Params.parallelism !== initialParams.parallelism
      ) {
        setProgressPct(55);
        setProgressStage('Tuning Argon2id to carrier parameters...');
        masterKey = trackSecretBuffer(await deriveMasterKey(pin, saltProbe, argon2Params));
        ({ encKey, stegoKey } = await deriveSubkeys(masterKey));
      }

      // Extract full payload
      setProgressPct(70);
      setProgressStage('Extracting payload blocks...');
      const armoredSize = RS_OUTER_HEADER_SIZE + numChunks * RS_CHUNK_TOTAL;
      const fullArmored = await extractPayloadShifted(
        pixelData,
        tempCanvas.width,
        tempCanvas.height,
        armoredSize,
        stegoKey,
        SALT_BYTES
      );

      // RS-Decode
      setProgressPct(82);
      setProgressStage('Reed-Solomon RS(255,191) error correction...');
      const { envelope } = parseRsArmored(fullArmored);
      const parts = splitEnvelope(envelope);

      // AES-256-GCM AEAD Decrypt
      setProgressPct(90);
      setProgressStage('AES-256-GCM authentication and decryption...');
      let plainCompressed = trackSecretBuffer(await aesGcmDecrypt(encKey, parts.ciphertext, parts.tag, parts.nonce, parts.aad));

      let plainBytes = plainCompressed;
      if (parts.header.compressionId === COMPRESS_DEFLATE) {
        setProgressPct(95);
        setProgressStage('Decompressing payload...');
        plainBytes = trackSecretBuffer(await decompressData(plainCompressed));
      }

      // Build Result
      if (parts.header.dataType === DATA_TYPE_CHUNK && isChunkRecord(plainBytes)) {
        // Album mode: chunk record detected
        const chunkInfo = parseChunkRecord(plainBytes);
        setAlbumChunks((prev: Record<number, ChunkInfo>) => ({ ...prev, [chunkInfo.chunkIndex]: chunkInfo }));
        setAlbumFileName(chunkInfo.fileName);
        setAlbumFileSize(chunkInfo.fileSize);
        setAlbumTotalChunks(chunkInfo.totalChunks);
        setIsAlbumMode(true);
        setResult(null);
        setPin('');
        setProgressPct(100);
        setProgressStage(`Chunk ${chunkInfo.chunkIndex + 1}/${chunkInfo.totalChunks} extracted ✓`);
        return;
      } else if (parts.header.dataType === DATA_TYPE_TEXT) {
        setResult({
          dataType: DATA_TYPE_TEXT,
          text: bytesToUtf8(plainBytes),
          sha256Verified: true
        });
      } else {
        let q = 0;
        if (plainBytes[q] !== 0x46 || plainBytes[q + 1] !== 0x49 || plainBytes[q + 2] !== 0x4C || plainBytes[q + 3] !== 0x45) {
          throw new Error('BAD_FILE_RECORD');
        }
        q += 4;
        const fileNameLen = (plainBytes[q] << 8) | plainBytes[q + 1]; q += 2;
        const fileName = bytesToUtf8(plainBytes.subarray(q, q + fileNameLen)); q += fileNameLen;
        const mimeLen = (plainBytes[q] << 8) | plainBytes[q + 1]; q += 2;
        const mime = bytesToUtf8(plainBytes.subarray(q, q + mimeLen)); q += mimeLen;

        const high = (plainBytes[q] << 24) | (plainBytes[q + 1] << 16) | (plainBytes[q + 2] << 8) | plainBytes[q + 3]; q += 4;
        const low = (plainBytes[q] << 24) | (plainBytes[q + 1] << 16) | (plainBytes[q + 2] << 8) | plainBytes[q + 3]; q += 4;
        const fileSize = high * 0x100000000 + (low >>> 0);

        const fileSha = plainBytes.subarray(q, q + 32); q += 32;
        const fileContent = plainBytes.subarray(q);

        const calcSha = await sha256(fileContent);
        const shaMatch = calcSha.length === fileSha.length && calcSha.every((v, i) => v === fileSha[i]);
        if (!shaMatch) throw new Error('SHA_MISMATCH');

        setResult({
          dataType: DATA_TYPE_FILE,
          fileName,
          fileSize,
          mimeType: mime,
          fileBlob: new Blob([fileContent], { type: mime || 'application/octet-stream' }),
          sha256Verified: true
        });
      }

      setProgressPct(100);
      setProgressStage('Extracted Successfully ✓');
      setPin('');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'GCM_AUTH_FAILED' || err.message === 'NOT_CRYPTOIMG_V5' || err.message === 'DECRYPT_FAILED_V4') {
        alert(t.err_decrypt);
      } else {
        alert('Extraction failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      wipeAllSecrets();
      setIsProcessing(false);
    }
  };

  const handleCopyText = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopiedNotification(true);
      setClipboardTimerSeconds(30);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      let count = 30;
      timerIntervalRef.current = setInterval(async () => {
        count--;
        setClipboardTimerSeconds(count);
        if (count <= 0) {
          clearInterval(timerIntervalRef.current);
          setClipboardTimerSeconds(null);
          setCopiedNotification(false);
          try {
            const cur = await navigator.clipboard.readText();
            if (cur === result.text) {
              await navigator.clipboard.writeText('');
            }
          } catch {
            // ignore
          }
        }
      }, 1000);
    } catch {
      // fallback
    }
  };

  const handleDownloadFile = () => {
    if (!result?.fileBlob) return;
    const url = URL.createObjectURL(result.fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName || 'extracted-file.bin';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-slate-900/40 select-none">
      {/* Left Input Form */}
      <div className="w-full md:w-[480px] lg:w-[500px] flex-shrink-0 border-r border-slate-800/80 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Unlock className="w-4 h-4 text-emerald-400" />
            {t.dec_title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.dec_subtitle}</p>
        </div>

        {/* 1. Photo-Key Carrier */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">{t.dec_step1_img}</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleKeyFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          {!keyImageFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-950/70 p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-900 group-hover:bg-emerald-950/50 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-300 group-hover:text-slate-100">{t.drop_key}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">PNG, WebP or AVIF container file</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 relative">
              <img
                src={keyImageDataUrl!}
                alt="Carrier preview"
                className="w-12 h-12 object-cover rounded-lg border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{keyImageFile.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {(keyImageFile.size / 1024).toFixed(1)} KB · {keyImageFile.type || 'image'}
                </p>
              </div>
              <button
                onClick={() => {
                  setKeyImageFile(null);
                  setKeyImageDataUrl(null);
                }}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Decryption PIN */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">{t.dec_step2_pin}</label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder={t.dec_pin_placeholder}
              maxLength={11}
              inputMode="numeric"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 font-mono outline-none pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleDecode}
            disabled={isProcessing}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 hover:shadow-emerald-900/40 hover:-translate-y-0.5'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{progressStage || 'Decrypting...'}</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>{t.btn_decode}</span>
              </>
            )}
          </button>

          {isProcessing && (
            <div className="space-y-1 p-2 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{progressStage}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Output Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        {/* Album Mode UI */}
        {isAlbumMode && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-amber-300">{t.album_mode || 'Album Mode'} — {albumFileName}</h3>
            </div>
            <div className="text-xs text-amber-200/80">
              <p>{t.album_extract?.replace('{count}', String(albumTotalChunks)) || `Load all ${albumTotalChunks} album images to extract`}</p>
              <p className="mt-1 font-mono text-[10px]">
                Loaded: {albumChunks.size} / {albumTotalChunks} chunks · {(albumFileSize / 1024).toFixed(1)} KB total
              </p>
            </div>
            {Array.from({ length: albumTotalChunks }, (_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full border ${albumChunks[i] ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700'}`} title={`Chunk ${i + 1}`} />
            ))}
            {/* Load more images button */}
            <input
              type="file"
              ref={albumInputRef}
              onChange={async (e) => {
                if (!e.target.files || !pin) return;
                const files: File[] = Array.from(e.target.files as FileList);
                setIsProcessing(true);
                let decoded = 0;
                for (const file of files) {
                  try {
                    setProgressStage(t.album_decoding?.replace('{current}', String(decoded + 1)).replace('{total}', String(files.length)) || `Decoding ${decoded + 1}/${files.length}`);
                    const dataUrl = await new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onload = (ev) => resolve(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    });
                    const chunkInfo = await decodeImageFromDataUrl(dataUrl, pin);
                    if (chunkInfo) {
                      setAlbumChunks((prev: Record<number, ChunkInfo>) => ({ ...prev, [chunkInfo.chunkIndex]: chunkInfo }));
                      setAlbumFileName(chunkInfo.fileName);
                      setAlbumFileSize(chunkInfo.fileSize);
                      setAlbumTotalChunks(chunkInfo.totalChunks);
                      setIsAlbumMode(true);
                    }
                    decoded++;
                  } catch (err: any) {
                    console.error(`Failed to decode ${file.name}:`, err);
                  }
                }
                setIsProcessing(false);
                e.target.value = '';
              }}
              accept="image/*"
              multiple
              className="hidden"
            />
            {Object.keys(albumChunks).length < albumTotalChunks && (
              <button
                onClick={() => albumInputRef.current?.click()}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Load remaining {albumTotalChunks - Object.keys(albumChunks).length} image(s)</span>
              </button>
            )}
            {Object.keys(albumChunks).length === albumTotalChunks && (
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-xs text-emerald-300 text-center">
                  ✓ All {albumTotalChunks} chunks loaded — ready to assemble
                </div>
                <button
                  onClick={async () => {
                    // Assemble file from chunks
                    const chunkValues: ChunkInfo[] = Object.values(albumChunks) as ChunkInfo[];
                    const sorted: ChunkInfo[] = chunkValues.sort((a: ChunkInfo, b: ChunkInfo) => a.chunkIndex - b.chunkIndex);
                    const totalSize: number = sorted.reduce((sum: number, c: ChunkInfo) => sum + c.chunkData.length, 0);
                    const assembled: Uint8Array = new Uint8Array(totalSize);
                    let off = 0;
                    for (const chunk of sorted) {
                      assembled.set(chunk.chunkData, off);
                      off += chunk.chunkData.length;
                    }
                    const calcSha = await sha256(assembled);
                    const expectedSha: Uint8Array = sorted[0].fileSha256;
                    const shaOk = calcSha.length === expectedSha.length && calcSha.every((v: number, i: number) => v === expectedSha[i]);
                    if (!shaOk) throw new Error('SHA_MISMATCH');
                    const blob = new Blob([assembled]);
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = albumFileName || 'extracted-file.bin';
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Assembled File ({albumFileName})</span>
                </button>
              </div>
            )}
          </div>
        )}
        {/* Deprecation warning for v4 */}
        {result?.isV4Legacy && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t.v4_warning_title}</span>
            </div>
            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              {t.v4_warning_desc}
            </p>
          </div>
        )}

        {/* Decrypted Payload Result */}
        {result ? (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4" />
                {t.result_title}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                SHA-256 VERIFIED ✓
              </span>
            </div>

            {result.dataType === DATA_TYPE_TEXT ? (
              <div className="flex-1 flex flex-col space-y-3 min-h-[220px]">
                <div className="flex-1 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 font-mono text-xs text-slate-100 whitespace-pre-wrap select-text overflow-y-auto max-h-[400px]">
                  {result.text}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.btn_copy_text}</span>
                  </button>
                  {clipboardTimerSeconds !== null && (
                    <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 bg-amber-950/40 border border-amber-800/50 px-2.5 py-2 rounded-xl">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{clipboardTimerSeconds}s</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
                    <File className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{result.fileName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {((result.fileSize || 0) / 1024).toFixed(1)} KB · {result.mimeType || 'binary'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.btn_download_file}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-xl bg-slate-950/40 border border-slate-800/80 text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-700" />
            <p className="text-xs font-medium">Decrypted text or binary download will be displayed here</p>
            <p className="text-[10px] text-slate-600 max-w-xs">
              Load an encoded carrier image, enter the corresponding PIN, and click Extract.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
