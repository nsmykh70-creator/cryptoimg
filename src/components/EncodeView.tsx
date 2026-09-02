import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  File, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Download, 
  Sparkles, 
  X,
  FileCheck,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  Argon2Params, 
  DataMode, 
  ImageMeta, 
  Language, 
  OutputFormat, 
  SelfTestStep 
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { validateBip39Mnemonic } from '../crypto/bip39';
import { 
  deriveMasterKey, 
  deriveSubkeys, 
  compressData, 
  aesGcmEncrypt, 
  buildAadHeader, 
  assembleEnvelope, 
  buildRsArmored,  embedPayloadWithSalt,
  extractPayloadUnkeyed,
  extractPayloadShifted,
  parseRsArmored,
  splitEnvelope,
  aesGcmDecrypt,
  decompressData,
  sha256,
  utf8ToBytes,
  randomBytes,
  SALT_BYTES,
  NONCE_BYTES,
  COMPRESS_DEFLATE,
  COMPRESS_NONE,
  DATA_TYPE_TEXT,
  DATA_TYPE_FILE,
  sleep,
  trackSecretBuffer,
  wipeAllSecrets,
  estimateUsableCapacity,
  estimateArmoredSize,
  validateImageDimensions
} from '../crypto/engine';

interface EncodeViewProps {
  lang: Language;
  argon2Params: Argon2Params;
}

export const EncodeView: React.FC<EncodeViewProps> = ({ lang, argon2Params }) => {
  const t = TRANSLATIONS[lang];

  // Form State
  const [coverImage, setCoverImage] = useState<ImageMeta | null>(null);
  const [dataMode, setDataMode] = useState<DataMode>('text');
  const [plainText, setPlainText] = useState<string>('');
  const [bipStatus, setBipStatus] = useState<any>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);

  const [authMode, setAuthMode] = useState<'pin' | 'passphrase'>('pin');
  const [pin, setPin] = useState<string>('');
  const [pinConfirm, setPinConfirm] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showPinConfirm, setShowPinConfirm] = useState<boolean>(false);

  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');

  // Execution & Self-Test State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');

  const [selfTestSteps, setSelfTestSteps] = useState<SelfTestStep[]>([
    { id: 1, titleKey: 'st_step1', status: 'idle' },
    { id: 2, titleKey: 'st_step2', status: 'idle' },
    { id: 3, titleKey: 'st_step3', status: 'idle' },
    { id: 4, titleKey: 'st_step4', status: 'idle' },
    { id: 5, titleKey: 'st_step5', status: 'idle' }
  ]);
  const [selfTestSummary, setSelfTestSummary] = useState<{ pass: boolean; text: string } | null>(null);

  const [outputDataUrl, setOutputDataUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const downloadRef = useRef<HTMLDivElement | null>(null);

  // Validate BIP-39 on text change
  useEffect(() => {
    let active = true;
    if (dataMode === 'text' && plainText.trim()) {
      validateBip39Mnemonic(plainText).then((res) => {
        if (active) setBipStatus(res);
      });
    } else {
      setBipStatus(null);
    }
    return () => { active = false; };
  }, [plainText, dataMode]);

  // Load Carrier Image
  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        try { validateImageDimensions(img.width, img.height); } catch (e: any) { alert(e.message); return; }
        setCoverImage({
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height,
          type: file.type || 'image/png',
          dataUrl
        });
        setOutputDataUrl(null);
        setOutputBlob(null);
        setSelfTestSummary(null);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Load Binary File Payload
  const handleBinaryFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      alert(t.err_file_too_large || 'File exceeds 50 MB limit');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFileBuffer(e.target.result as ArrayBuffer);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPlainText(text);
      }
    } catch {
      // Fallback
    }
  };

  const updateStepStatus = (id: number, status: 'idle' | 'running' | 'success' | 'failed') => {
    setSelfTestSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  // Main Encode Process
  const handleEncode = async () => {
    if (!coverImage || !coverImage.dataUrl) {
      alert(t.err_no_img);
      return;
    }
    if (dataMode === 'text' && !plainText.trim()) {
      alert(t.err_no_text);
      return;
    }
    if (dataMode === 'file' && (!selectedFile || !fileBuffer)) {
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

    // Pre-encode capacity check — avoid expensive Argon2 if data won't fit
    {
      const usableCap = estimateUsableCapacity(coverImage.width, coverImage.height);
      let estimatedArmored: number;
      if (dataMode === 'text') {
        const textBytes = utf8ToBytes(plainText).length;
        // Deflate rarely compresses text below 60 % of original; use 1.0× as worst-case
        estimatedArmored = estimateArmoredSize(textBytes);
      } else {
        // For binary files (especially already-compressed ones like PNG),
        // assume zero compression benefit
        estimatedArmored = estimateArmoredSize(fileBuffer!.byteLength);
      }
      if (estimatedArmored > usableCap) {
        const requiredKB = (estimatedArmored / 1024).toFixed(0);
        const availableKB = (usableCap / 1024).toFixed(0);
        alert(
          (t.err_capacity_too_large || 'Payload too large for this image.')
            .replace('{req}', requiredKB)
            .replace('{avail}', availableKB)
        );
        return;
      }
    }

    setIsProcessing(true);
    setProgressPct(5);
    setProgressStage('Argon2id Key Derivation...');
    setSelfTestSummary(null);
    setSelfTestSteps((prev) => prev.map((s) => ({ ...s, status: 'idle' })));

    try {
      // 1. Prepare raw payload
      let plainBytes: Uint8Array;
      let dataType: number;

      if (dataMode === 'text') {
        plainBytes = trackSecretBuffer(utf8ToBytes(plainText));
        dataType = DATA_TYPE_TEXT;
      } else {
        const fileBytes = trackSecretBuffer(new Uint8Array(fileBuffer!));
        const fileNameBytes = utf8ToBytes(selectedFile!.name || 'file.bin');
        const mimeBytes = utf8ToBytes(selectedFile!.type || 'application/octet-stream');
        const fileSha = trackSecretBuffer(await sha256(fileBytes));

        // Format: "FILE" (4) + nameLen (2) + name + mimeLen (2) + mime + size (8) + sha (32) + data
        const recordLen = 4 + 2 + fileNameBytes.length + 2 + mimeBytes.length + 8 + 32 + fileBytes.length;
        const record = trackSecretBuffer(new Uint8Array(recordLen));
        let p = 0;
        record[p++] = 0x46; record[p++] = 0x49; record[p++] = 0x4C; record[p++] = 0x45; // "FILE"
        record[p++] = (fileNameBytes.length >> 8) & 0xFF; record[p++] = fileNameBytes.length & 0xFF;
        record.set(fileNameBytes, p); p += fileNameBytes.length;
        record[p++] = (mimeBytes.length >> 8) & 0xFF; record[p++] = mimeBytes.length & 0xFF;
        record.set(mimeBytes, p); p += mimeBytes.length;

        // write 64-bit size
        const high = Math.floor(fileBytes.length / 0x100000000);
        const low = fileBytes.length >>> 0;
        record[p++] = (high >>> 24) & 0xFF; record[p++] = (high >>> 16) & 0xFF; record[p++] = (high >>> 8) & 0xFF; record[p++] = high & 0xFF;
        record[p++] = (low >>> 24) & 0xFF; record[p++] = (low >>> 16) & 0xFF; record[p++] = (low >>> 8) & 0xFF; record[p++] = low & 0xFF;

        record.set(fileSha, p); p += 32;
        record.set(fileBytes, p);

        plainBytes = record;
        dataType = DATA_TYPE_FILE;
      }

      // 2. Argon2id Key Derivation
      setProgressPct(20);
      setProgressStage('Deriving subkeys via HKDF...');
      const salt = trackSecretBuffer(randomBytes(SALT_BYTES));
      const masterKey = trackSecretBuffer(await deriveMasterKey(pin, salt, argon2Params));
      const { encKey, stegoKey } = await deriveSubkeys(masterKey);

      // 3. Compression
      setProgressPct(35);
      setProgressStage('Applying Deflate compression...');
      const { data: plainCompressed, compressed } = await compressData(plainBytes);
      const compressionId = compressed ? COMPRESS_DEFLATE : COMPRESS_NONE;

      // 4. AES-256-GCM authenticated encryption
      setProgressPct(50);
      setProgressStage('Encrypting with AES-256-GCM...');
      const nonce = trackSecretBuffer(randomBytes(NONCE_BYTES));
      const payloadLen = plainCompressed.length;
      const aadHeader = buildAadHeader(dataType, compressionId, payloadLen, argon2Params);
      const { ciphertext, tag } = await aesGcmEncrypt(encKey, plainCompressed, nonce, aadHeader);

      // 5. Envelope packing & Reed-Solomon armoring
      setProgressPct(65);
      setProgressStage('Reed-Solomon RS(255,191) forward error correction...');
      const envelope = assembleEnvelope(aadHeader, salt, nonce, ciphertext, tag);
      const armored = buildRsArmored(envelope, dataType, compressionId, argon2Params);

      // 6. Draw on canvas and embed
      setProgressPct(80);
      setProgressStage('Embedding into carrier via adaptive steganography...');
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image decode error'));
        img.src = coverImage.dataUrl!;
      });

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Step 1 of Self-Test
      updateStepStatus(1, 'running');
      await sleep(20);
      const embedResult = await embedPayloadWithSalt(
        imgData.data,
        canvas.width,
        canvas.height,
        salt,
        armored,
        stegoKey
      );

      if (!embedResult.ok) {
        updateStepStatus(1, 'failed');
        alert(t.err_capacity.replace('{req}', String(embedResult.req)).replace('{avail}', String(embedResult.avail)));
        setIsProcessing(false);
        return;
      }
      updateStepStatus(1, 'success');
      ctx.putImageData(imgData, 0, 0);

      // Self-Test Step 2: Extraction
      updateStepStatus(2, 'running');
      setProgressPct(88);
      setProgressStage('Self-test: Extracting bit planes...');
      await sleep(20);
      const saltBack = extractPayloadUnkeyed(imgData.data, SALT_BYTES);
      const armoredBack = await extractPayloadShifted(
        imgData.data,
        canvas.width,
        canvas.height,
        armored.length,
        stegoKey,
        SALT_BYTES
      );
      updateStepStatus(2, 'success');

      // Self-Test Step 3: RS Decode
      updateStepStatus(3, 'running');
      setProgressPct(92);
      setProgressStage('Self-test: Reed-Solomon decoding...');
      await sleep(20);
      const { envelope: envBack } = parseRsArmored(armoredBack);
      const parts = splitEnvelope(envBack);
      updateStepStatus(3, 'success');

      // Self-Test Step 4: AES-GCM Auth verification
      updateStepStatus(4, 'running');
      setProgressPct(96);
      setProgressStage('Self-test: Verifying GCM Auth Tag...');
      await sleep(20);
      const masterKey2 = trackSecretBuffer(await deriveMasterKey(pin, parts.salt, argon2Params));
      const { encKey: encKey2 } = await deriveSubkeys(masterKey2);
      const plainBack = trackSecretBuffer(await aesGcmDecrypt(encKey2, parts.ciphertext, parts.tag, parts.nonce, parts.aad));
      updateStepStatus(4, 'success');

      // Self-Test Step 5: SHA-256 Compare
      updateStepStatus(5, 'running');
      setProgressPct(99);
      setProgressStage('Self-test: Comparing SHA-256 checksum...');
      await sleep(20);
      let plainFinal = plainBack;
      if (parts.header.compressionId === COMPRESS_DEFLATE) {
        plainFinal = trackSecretBuffer(await decompressData(plainBack));
      }

      const origSha = await sha256(plainBytes);
      const backSha = await sha256(plainFinal);
      const matched = origSha.length === backSha.length && origSha.every((v, i) => v === backSha[i]);

      if (!matched) {
        updateStepStatus(5, 'failed');
        setSelfTestSummary({ pass: false, text: t.st_fail });
        setIsProcessing(false);
        return;
      }
      updateStepStatus(5, 'success');
      setSelfTestSummary({ pass: true, text: t.st_pass });

      // Generate export URL
      const mime = outputFormat === 'webp' ? 'image/webp' : outputFormat === 'avif' ? 'image/avif' : 'image/png';
      canvas.toBlob((blob) => {
        if (blob) {
          setOutputBlob(blob);
          const url = URL.createObjectURL(blob);
          setOutputDataUrl(url);
          setProgressPct(100);
          setProgressStage('Complete ✓');

          // Trigger celebratory confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10b981', '#34d399', '#059669', '#6ee7b7']
          });

          // Auto-scroll to download button after encoding
          setTimeout(() => {
            downloadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }, mime, 1.0);

      // Memory hygiene: clean PIN inputs
      setPin('');
      setPinConfirm('');
    } catch (err: any) {
      console.error(err);
      alert('Encryption error: ' + (err.message || 'Unknown'));
    } finally {
      wipeAllSecrets();
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cryptoimg-key-${Date.now()}.${outputFormat}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-slate-900/40 select-none">
      {/* Left Column: Inputs & Controls */}
      <div className="w-full md:w-[480px] lg:w-[520px] flex-shrink-0 border-r border-slate-800/80 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            {t.enc_title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.enc_subtitle}</p>
        </div>

        {/* 1. Carrier Image */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>{t.enc_step1_img}</span>
            {coverImage && (
              <span className="text-[11px] text-emerald-400 font-mono">
                {coverImage.width}×{coverImage.height}px (~{(estimateUsableCapacity(coverImage.width, coverImage.height) / 1024).toFixed(0)} KB)
              </span>
            )}
          </label>

          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          {!coverImage ? (
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-950/70 p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-900 group-hover:bg-emerald-950/50 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-300 group-hover:text-slate-100">{t.drop_photo}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{t.drop_photo_sub}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 relative group">
              <img
                src={coverImage.dataUrl}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-lg border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{coverImage.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {coverImage.width} × {coverImage.height} · {(coverImage.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => setCoverImage(null)}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Payload Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">{t.enc_step2_data}</label>
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDataMode('text')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  dataMode === 'text'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>{t.mode_text}</span>
              </button>
              <button
                type="button"
                onClick={() => setDataMode('file')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  dataMode === 'file'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <File className="w-3 h-3" />
                <span>{t.mode_file}</span>
              </button>
            </div>
          </div>

          {dataMode === 'text' ? (
            <div className="space-y-1.5">
              <div className="relative">
                <textarea
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder={t.text_placeholder}
                  rows={4}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 resize-none font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-2 top-2 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 hover:text-slate-100 rounded border border-slate-700 transition-colors font-sans cursor-pointer"
                >
                  {t.btn_paste}
                </button>
              </div>

              {/* BIP39 Status Pill */}
              {bipStatus && (
                <div
                  className={`flex items-start gap-1.5 text-[11px] p-2 rounded-lg border ${
                    bipStatus.status === 'valid'
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : bipStatus.status === 'invalid_words' || bipStatus.status === 'invalid_checksum'
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {bipStatus.status === 'valid' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    {bipStatus.status === 'valid' && (
                      <span>{t.bip_valid.replace('{count}', String(bipStatus.wordCount))}</span>
                    )}
                    {bipStatus.status === 'invalid_words' && (
                      <span>{t.bip_invalid_words.replace('{words}', bipStatus.invalidWords?.join(', ') || '')}</span>
                    )}
                    {bipStatus.status === 'invalid_checksum' && (
                      <span>{t.bip_invalid_checksum}</span>
                    )}
                    {bipStatus.status === 'invalid_length' && (
                      <span>{t.bip_invalid_length}</span>
                    )}
                    {bipStatus.status === 'plain_text' && <span>{t.bip_plain}</span>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleBinaryFile(e.target.files[0])}
                className="hidden"
              />
              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-slate-950/70 p-4 rounded-xl flex items-center justify-center gap-2.5 text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
                >
                  <File className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs">{t.drop_file}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'binary'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFileBuffer(null);
                    }}
                    className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
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
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input type={showPin ? 'text' : 'password'} value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder={t.pin1_placeholder} maxLength={11} inputMode="numeric"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 font-mono outline-none pr-8" />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer">
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showPinConfirm ? 'text' : 'password'} value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder={t.pin2_placeholder} maxLength={11} inputMode="numeric"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 font-mono outline-none pr-8" />
                  <button type="button" onClick={() => setShowPinConfirm(!showPinConfirm)} className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer">
                    {showPinConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                {t.pin_hint}
              </p>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="relative">
                  <input type={showPin ? 'text' : 'password'} value={pin}
                    onChange={(e) => setPin(e.target.value)} placeholder="Enter passphrase (12+ characters, any text)"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 font-mono outline-none pr-8" />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer">
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showPinConfirm ? 'text' : 'password'} value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value)} placeholder="Confirm passphrase"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 font-mono outline-none pr-8" />
                  <button type="button" onClick={() => setShowPinConfirm(!showPinConfirm)} className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer">
                    {showPinConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
              <p className="text-[10px] text-slate-500 leading-tight flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                Passphrase recommended for sensitive data. Minimum 12 characters, any UTF-8 text.
              </p>
            </>
          )}
        </div>

        {/* 4. Output Format Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">{t.enc_step4_format}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['png', 'webp', 'avif'] as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setOutputFormat(fmt)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold uppercase font-mono transition-all text-center border cursor-pointer ${
                  outputFormat === fmt
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-xs'
                    : 'bg-slate-950/60 hover:bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button & Progress */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleEncode}
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
                <span>{progressStage || 'Processing...'}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>{t.btn_encode}</span>
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

          {/* Mobile Download Button — visible in left column after encoding */}
          {outputDataUrl && (
            <div ref={downloadRef} className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-3">
              <div className="text-center">
                <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {t.key_ready_title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.key_ready_desc}</p>
              </div>
              <img src={outputDataUrl} alt="Encrypted" className="w-full max-h-[120px] object-contain rounded-lg border border-emerald-800/30" />
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.btn_download_img} ({outputFormat.toUpperCase()})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Self-Test Checklist & Output Preview — hidden on mobile */}
      <div className="hidden md:flex flex-1 flex-col h-full overflow-y-auto p-4 space-y-3">
        {/* Self-Test Panel */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {t.st_title}
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">5-STAGE INTEGRITY AUDIT</span>
          </div>

          <div className="space-y-1.5">
            {selfTestSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60"
              >
                <span className="text-slate-300">{t[step.titleKey] || step.titleKey}</span>
                <span className="font-mono text-[10px]">
                  {step.status === 'idle' && <span className="text-slate-600">IDLE</span>}
                  {step.status === 'running' && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> RUNNING
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
              className={`p-2.5 rounded-lg text-xs font-semibold border ${
                selfTestSummary.pass
                  ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
              }`}
            >
              {selfTestSummary.text}
            </div>
          )}
        </div>

        {/* Output Photo-Key Preview Canvas */}
        <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 relative">
          <canvas ref={canvasRef} className="max-w-full max-h-[300px] object-contain rounded-lg shadow-xl border border-slate-800" />

          {outputDataUrl && (
            <div className="mt-4 flex flex-col items-center space-y-3 w-full max-w-sm">
              <div className="text-center">
                <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {t.key_ready_title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.key_ready_desc}</p>
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
          )}

          {!outputDataUrl && !coverImage && (
            <div className="text-center text-slate-600 space-y-1">
              <Info className="w-6 h-6 mx-auto text-slate-700" />
              <p className="text-xs">Photo-key preview and verification canvas will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
