export type Language = 'ru' | 'en' | 'es' | 'de' | 'fr' | 'zh';

export type ActiveTab = 'encode' | 'decode' | 'inspector' | 'benchmark' | 'donate' | 'album-encode' | 'album-decode';

export type DataMode = 'text' | 'file';

export type OutputFormat = 'png' | 'webp' | 'avif';

export interface Argon2Params {
  memory: number; // in KiB (e.g. 65536 = 64MB)
  iterations: number;
  parallelism: number;
  benchmarkMs?: number;
}

export interface SelfTestStep {
  id: number;
  titleKey: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  details?: string;
}

export interface ImageMeta {
  name: string;
  size: number;
  width: number;
  height: number;
  type: string;
  dataUrl?: string;
}

export interface Bip39CheckResult {
  status: 'valid' | 'invalid_words' | 'invalid_checksum' | 'invalid_length' | 'plain_text';
  wordCount: number;
  invalidWords?: string[];
}

export interface DecodedResult {
  dataType: number; // 0 = text, 1 = file
  text?: string;
  fileBlob?: Blob;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isV4Legacy?: boolean;
  sha256Verified?: boolean;
}

export interface WalletInfo {
  coin: 'btc' | 'eth' | 'usdt';
  name: string;
  symbol: string;
  network: string;
  address: string;
  uri: string;
  warningKey: string;
}
