import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  Activity,
  Layers,
  Clock
} from 'lucide-react';
import { Argon2Params, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { benchmarkArgon2 } from '../crypto/engine';

interface BenchmarkViewProps {
  lang: Language;
  params: Argon2Params | null;
  onUpdateParams: (params: Argon2Params) => void;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  lang,
  params,
  onUpdateParams
}) => {
  const t = TRANSLATIONS[lang];
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);

  const runTest = async () => {
    setIsRunning(true);
    const start = performance.now();
    try {
      const newParams = await benchmarkArgon2();
      const dur = performance.now() - start;
      setLastDurationMs(dur);
      onUpdateParams(newParams);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          {t.bench_title}
        </h2>
        <p className="text-xs text-slate-400 mt-1">{t.bench_subtitle}</p>
      </div>

      {/* Action Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Argon2id RFC 9106 Memory-Hard Key Derivation
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            Calibrates memory and iteration parameters to achieve an optimal ~2.0s hashing latency per PIN code.
          </p>
        </div>

        <button
          type="button"
          onClick={runTest}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
            isRunning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950 hover:-translate-y-0.5'
          }`}
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Benchmarking...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>{t.btn_run_bench}</span>
            </>
          )}
        </button>
      </div>

      {/* Benchmark Metrics Grid */}
      {params && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              {t.bench_mem}
            </span>
            <p className="text-lg font-bold font-mono text-slate-100">
              {params.memory / 1024} MB
            </p>
            <p className="text-[10px] text-slate-500">{params.memory} KiB allocated buffer</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {t.bench_iter}
            </span>
            <p className="text-lg font-bold font-mono text-slate-100">
              t = {params.iterations}
            </p>
            <p className="text-[10px] text-slate-500">Sequential passes</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              {t.bench_par}
            </span>
            <p className="text-lg font-bold font-mono text-slate-100">
              p = {params.parallelism}
            </p>
            <p className="text-[10px] text-slate-500">Parallel execution lanes</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {t.bench_latency}
            </span>
            <p className="text-lg font-bold font-mono text-emerald-400">
              {lastDurationMs ? `${(lastDurationMs / 1000).toFixed(2)}s` : '~2.00s'}
            </p>
            <p className="text-[10px] text-slate-500">Target: 2.0s</p>
          </div>
        </div>
      )}

      {/* Security Architecture Explainer */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Brute-Force Attack Economics
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Unlike standard SHA-256 or PBKDF2 which can be accelerated by GPUs and ASICs at billions of hashes per second, 
          <b> Argon2id (RFC 9106)</b> forces an attacker to dedicate <b>64 MB – 256 MB of ultra-fast physical RAM</b> for every single guess.
          This makes offline brute-force attacks across 8 to 11 digit PIN spaces economically prohibitive and unfeasible on cluster hardware.
        </p>
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.bench_status_tuned}</span>
        </div>
      </div>
    </div>
  );
};
