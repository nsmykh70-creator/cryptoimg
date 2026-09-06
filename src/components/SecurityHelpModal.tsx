import React from 'react';
import { X, Shield, Lock, Cpu, Layers, HardDrive, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface SecurityHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SecurityHelpModal: React.FC<SecurityHelpModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Cryptoimg v5.1 Protocol Specifications</h3>
              <p className="text-[11px] text-slate-400">Cryptographic steganography architecture overview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>1. Memory-Hard KDF: Argon2id (RFC 9106)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The PIN code is transformed into a 256-bit cryptographic master key using Argon2id with 64–256 MB of RAM cost. 
              This prevents GPU/ASIC parallel brute-force attacks by rendering hardware password crackers bandwidth- and memory-constrained.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>2. Domain Separation via HKDF-SHA256</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The master key is expanded into three independent 256-bit subkeys using HKDF-SHA256: 
              <code>encKey</code> for AES-256-GCM, <code>stegoKey</code> for keyed pseudo-random pixel permutation, and <code>metaKey</code> for integrity checks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-teal-400 font-bold">
              <Shield className="w-4 h-4" />
              <span>3. Authenticated Encryption: AES-256-GCM AEAD</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              All payload bytes are encrypted with AES-256-GCM. The 32-byte envelope header (specifying algorithms, versions, parameters) 
              is included as Additional Authenticated Data (AAD). Any modification of ciphertext or header is rejected via authentication tag failure.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <HardDrive className="w-4 h-4" />
              <span>4. Forward Error Correction: Reed-Solomon RS(255, 191)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The encrypted envelope is segmented into 191-byte chunks protected by 64 error-correction parity bytes (total 255 bytes/chunk). 
              This enables perfect recovery even if image pixels suffer localized corruption or minor bit flips during file transfers.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>5. Keyed Adaptive Steganography</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Data bits are embedded into 2 least significant bits (LSB) across R, G, and B channels (alpha channel is untouched). 
              Pixel insertion positions are deterministically shuffled via an HMAC-DRBG seeded by <code>stegoKey</code>, and high-texture 
              variance regions are prioritized to resist statistical steganalysis.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
