import { argon2id } from 'hash-wasm';
import { Argon2Params, DecodedResult, SelfTestStep } from '../types';
import { GF_QR_CODE_256, RS_Decoder, RS_Encoder } from './reedSolomon';

// ============================================================================
// CONSTANTS (v5.1 Protocol)
// ============================================================================
export const VERSION = 0x51; // v5.1
export const MAGIC = [0x43, 0x52, 0x35, 0x31]; // "CR51"
export const MAGIC_V4 = [0x43, 0x52, 0x50, 0x56]; // "CRPV"

export const HEADER_AAD_SIZE = 32;

export const KDF_ID_ARGON2ID = 0x02;
export const CIPHER_ID_AES_256_GCM = 0x02;
export const ECC_ID_RS_255_223 = 0x01;

export const DATA_TYPE_TEXT = 0;
export const DATA_TYPE_FILE = 1;
export const DATA_TYPE_CHUNK = 2; // album mode: file split across multiple images

export const COMPRESS_NONE = 0;
export const COMPRESS_DEFLATE = 1;

export const SALT_BYTES = 16;

// Security: max image dimensions to prevent client-side DoS
export const MAX_IMAGE_PIXELS = 25_000_000; // 25M pixels (~5000x5000)
export const MAX_CARRIER_BYTES = 100 * 1024 * 1024; // 100 MB max carrier file

/**
 * Validate image dimensions to prevent memory exhaustion DoS.
 * Throws if image is too large to process safely.
 */
export function validateImageDimensions(width: number, height: number): void {
  const pixels = width * height;
  if (pixels > MAX_IMAGE_PIXELS) {
    throw new Error(`IMAGE_TOO_LARGE: ${width}x${height} = ${(pixels / 1_000_000).toFixed(1)}M pixels (max ${MAX_IMAGE_PIXELS / 1_000_000}M)`);
  }
}
export const NONCE_BYTES = 12; // GCM standard 96-bit nonce
export const TAG_BYTES = 16; // GCM 128-bit authentication tag
export const ARGON2_HASH_LENGTH = 32;

export const ARGON2_DEFAULT_MEMORY = 65536; // 64 MiB (KiB)
export const ARGON2_DEFAULT_ITERATIONS = 3;
export const ARGON2_DEFAULT_PARALLELISM = 4;
export const ARGON2_MIN_MEMORY = 16384; // 16 MiB
export const ARGON2_MAX_MEMORY = 262144; // 256 MiB
export const ARGON2_TARGET_MS = 2000; // 2.0s target
export const ARGON2_BENCHMARK_KEY = 'cryptoimg_v5_argon2_benchmark';
export const ARGON2_BENCHMARK_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// v4 legacy fixed parameters
export const ARGON2_V4_MEMORY = 65536;
export const ARGON2_V4_ITERATIONS = 3;
export const ARGON2_V4_PARALLELISM = 1;

export const RS_ECC_BYTES = 64;
export const RS_CHUNK_DATA = 191;
export const RS_CHUNK_TOTAL = 255;
export const RS_OUTER_HEADER_SIZE = 21;

export const STEGO_BITS_PER_PIXEL = 6; // 2 bits R + 2 bits G + 2 bits B (alpha untouched)

const INFO_ENC_KEY = new TextEncoder().encode("Cryptoimg-v5/encKey");
const INFO_STEGO_KEY = new TextEncoder().encode("Cryptoimg-v5/stegoKey");
const INFO_META_KEY = new TextEncoder().encode("Cryptoimg-v5/metaKey");

// Global cached codecs
let rsEncoderInstance: RS_Encoder | null = null;
let rsDecoderInstance: RS_Decoder | null = null;

function getRsCodecs() {
  if (!rsEncoderInstance || !rsDecoderInstance) {
    const field = GF_QR_CODE_256();
    rsEncoderInstance = new RS_Encoder(field);
    rsDecoderInstance = new RS_Decoder(field);
  }
  return { encoder: rsEncoderInstance, decoder: rsDecoderInstance };
}

// Memory tracking
let secretBuffers: Uint8Array[] = [];

export function trackSecretBuffer(buf: Uint8Array): Uint8Array {
  secretBuffers.push(buf);
  return buf;
}

export function wipeSecretBuffer(buf: Uint8Array | null | undefined): void {
  if (!buf) return;
  try {
    buf.fill(0);
  } catch {
    // ignore
  }
}

export function wipeAllSecrets(): void {
  for (const b of secretBuffers) {
    wipeSecretBuffer(b);
  }
  secretBuffers = [];
}

export function utf8ToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return trackSecretBuffer(buf);
}

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hash);
}

function writeU32(buf: Uint8Array, off: number, val: number): number {
  buf[off] = (val >>> 24) & 0xFF;
  buf[off + 1] = (val >>> 16) & 0xFF;
  buf[off + 2] = (val >>> 8) & 0xFF;
  buf[off + 3] = val & 0xFF;
  return off + 4;
}

function readU32(buf: Uint8Array, off: number): number {
  return ((buf[off] << 24) | (buf[off + 1] << 16) | (buf[off + 2] << 8) | buf[off + 3]) >>> 0;
}

function writeU64(buf: Uint8Array, off: number, val: number): number {
  const high = Math.floor(val / 0x100000000);
  const low = val >>> 0;
  let p = off;
  p = writeU32(buf, p, high);
  p = writeU32(buf, p, low);
  return p;
}

function readU64(buf: Uint8Array, off: number): number {
  const high = readU32(buf, off);
  const low = readU32(buf, off + 4);
  return high * 0x100000000 + low;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ============================================================================
// ARGON2ID & BENCHMARK
// ============================================================================
let cachedArgon2Params: Argon2Params | null = null;

export async function benchmarkArgon2(): Promise<Argon2Params> {
  const salt = randomBytes(16);
  const start = performance.now();
  await argon2id({
    password: 'cryptoimg-benchmark-test',
    salt: salt,
    parallelism: 1,
    iterations: 1,
    memorySize: 8192, // 8 MB
    hashLength: ARGON2_HASH_LENGTH,
    outputType: 'binary'
  });
  const elapsed = performance.now() - start;

  const parallelism = ARGON2_DEFAULT_PARALLELISM;
  let memory = ARGON2_DEFAULT_MEMORY;
  const iterations = ARGON2_DEFAULT_ITERATIONS;

  const estDefault = elapsed * (ARGON2_DEFAULT_MEMORY / 8192) * (ARGON2_DEFAULT_ITERATIONS / 1) / (ARGON2_DEFAULT_PARALLELISM / 1);

  if (estDefault < ARGON2_TARGET_MS * 0.75) {
    const ratio = ARGON2_TARGET_MS / Math.max(1, estDefault);
    memory = Math.min(ARGON2_MAX_MEMORY, Math.floor(ARGON2_DEFAULT_MEMORY * ratio));
  } else if (estDefault > ARGON2_TARGET_MS * 1.5) {
    const ratio = ARGON2_TARGET_MS / estDefault;
    memory = Math.max(ARGON2_MIN_MEMORY, Math.floor(ARGON2_DEFAULT_MEMORY * ratio));
  }

  const blockSize = 4 * parallelism;
  memory = Math.max(blockSize, Math.ceil(memory / blockSize) * blockSize);

  const params: Argon2Params = { memory, iterations, parallelism, benchmarkMs: elapsed };
  cachedArgon2Params = params;
  try {
    localStorage.setItem(ARGON2_BENCHMARK_KEY, JSON.stringify({ params, timestamp: Date.now() }));
  } catch {
    // ignore
  }
  return params;
}

export async function getArgon2Params(forceBenchmark = false): Promise<Argon2Params> {
  if (!forceBenchmark && cachedArgon2Params) return cachedArgon2Params;
  if (!forceBenchmark) {
    try {
      const stored = JSON.parse(localStorage.getItem(ARGON2_BENCHMARK_KEY) || 'null');
      if (stored && stored.params && (Date.now() - stored.timestamp < ARGON2_BENCHMARK_TTL)) {
        cachedArgon2Params = stored.params;
        return stored.params;
      }
    } catch {
      // ignore
    }
  }
  return benchmarkArgon2();
}

export async function deriveMasterKey(pin: string, salt: Uint8Array, params?: Argon2Params): Promise<Uint8Array> {
  const p = params || {
    memory: ARGON2_DEFAULT_MEMORY,
    iterations: ARGON2_DEFAULT_ITERATIONS,
    parallelism: ARGON2_DEFAULT_PARALLELISM
  };
  const raw = await argon2id({
    password: pin,
    salt: salt,
    parallelism: p.parallelism,
    iterations: p.iterations,
    memorySize: p.memory,
    hashLength: ARGON2_HASH_LENGTH,
    outputType: 'binary'
  });
  const out = new Uint8Array(raw);
  return trackSecretBuffer(out);
}

// HKDF-SHA256
export async function hkdfExpand(masterKey: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey(
    'raw', masterKey, 'HKDF', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info },
    baseKey,
    length * 8
  );
  return trackSecretBuffer(new Uint8Array(bits));
}

export async function deriveSubkeys(masterKey: Uint8Array): Promise<{ encKey: Uint8Array; stegoKey: Uint8Array; metaKey: Uint8Array }> {
  const [encKey, stegoKey, metaKey] = await Promise.all([
    hkdfExpand(masterKey, INFO_ENC_KEY, 32),
    hkdfExpand(masterKey, INFO_STEGO_KEY, 32),
    hkdfExpand(masterKey, INFO_META_KEY, 32)
  ]);
  // metaKey reserved for future integrity metadata binding
  return { encKey, stegoKey, metaKey };
}

// ============================================================================
// AES-256-GCM AEAD ENCRYPTION & DECRYPTION
// ============================================================================
export async function aesGcmEncrypt(
  encKey: Uint8Array,
  plaintext: Uint8Array,
  nonce: Uint8Array,
  aad: Uint8Array
): Promise<{ ciphertext: Uint8Array; tag: Uint8Array }> {
  const key = await crypto.subtle.importKey(
    'raw', encKey, { name: 'AES-GCM' }, false, ['encrypt']
  );
  const buf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: aad, tagLength: TAG_BYTES * 8 },
    key,
    plaintext
  );
  const full = trackSecretBuffer(new Uint8Array(buf));
  return {
    ciphertext: full.subarray(0, full.length - TAG_BYTES),
    tag: full.subarray(full.length - TAG_BYTES)
  };
}

export async function aesGcmDecrypt(
  encKey: Uint8Array,
  ciphertext: Uint8Array,
  tag: Uint8Array,
  nonce: Uint8Array,
  aad: Uint8Array
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw', encKey, { name: 'AES-GCM' }, false, ['decrypt']
  );
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext, 0);
  combined.set(tag, ciphertext.length);
  try {
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce, additionalData: aad, tagLength: TAG_BYTES * 8 },
      key,
      combined
    );
    return trackSecretBuffer(new Uint8Array(pt));
  } catch (e) {
    const err = new Error('GCM_AUTH_FAILED');
    (err as unknown as { cause: unknown }).cause = e;
    throw err;
  }
}

// ============================================================================
// COMPRESSION
// ============================================================================
export async function compressData(data: Uint8Array): Promise<{ data: Uint8Array; compressed: boolean }> {
  if (typeof CompressionStream === 'undefined') {
    return { data, compressed: false };
  }
  try {
    const cs = new CompressionStream('deflate');
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();
    const chunks: Uint8Array[] = [];
    const reader = cs.readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const total = chunks.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      out.set(c, off);
      off += c.length;
    }
    if (out.length < data.length) {
      return { data: out, compressed: true };
    }
    return { data, compressed: false };
  } catch {
    return { data, compressed: false };
  }
}

export async function decompressData(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') throw new Error('NO_DECOMPRESS');
  const ds = new DecompressionStream('deflate');
  const writer = ds.writable.getWriter();
  writer.write(data);
  writer.close();
  const chunks: Uint8Array[] = [];
  const reader = ds.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return trackSecretBuffer(out);
}

// ============================================================================
// REED-SOLOMON ECC
// ============================================================================
export function rsEncodeChunk(dataBytes: Uint8Array | number[]): Int32Array {
  const { encoder } = getRsCodecs();
  const msg = new Int32Array(RS_CHUNK_TOTAL);
  for (let i = 0; i < dataBytes.length; i++) msg[i] = dataBytes[i];
  encoder.encode(msg, RS_ECC_BYTES);
  return msg;
}

export function rsDecodeChunk(receivedBytes: Uint8Array | number[]): number[] {
  const { decoder } = getRsCodecs();
  const msg = new Int32Array(RS_CHUNK_TOTAL);
  for (let i = 0; i < receivedBytes.length; i++) msg[i] = receivedBytes[i];
  decoder.decode(msg, RS_ECC_BYTES);
  return Array.prototype.slice.call(msg.subarray(0, RS_CHUNK_DATA));
}

// ============================================================================
// ENVELOPE STRUCTS & AAD
// ============================================================================
export function buildAadHeader(
  dataType: number,
  compressionId: number,
  payloadLen: number,
  argon2Params: Argon2Params
): Uint8Array {
  const buf = new Uint8Array(HEADER_AAD_SIZE);
  let p = 0;
  buf[p++] = MAGIC[0]; buf[p++] = MAGIC[1]; buf[p++] = MAGIC[2]; buf[p++] = MAGIC[3];
  buf[p++] = VERSION;
  buf[p++] = 0; // FLAGS
  buf[p++] = KDF_ID_ARGON2ID;
  buf[p++] = CIPHER_ID_AES_256_GCM;
  buf[p++] = ECC_ID_RS_255_223;
  buf[p++] = dataType & 0xFF;
  buf[p++] = compressionId & 0xFF;
  buf[p++] = SALT_BYTES;
  buf[p++] = NONCE_BYTES;
  buf[p++] = TAG_BYTES;
  p = writeU32(buf, p, argon2Params.memory);
  p = writeU32(buf, p, argon2Params.iterations);
  buf[p++] = argon2Params.parallelism;
  p = writeU64(buf, p, payloadLen);
  return buf;
}

export function parseAadHeader(buf: Uint8Array) {
  if (buf.length < HEADER_AAD_SIZE) throw new Error('HEADER_TOO_SHORT');
  let p = 0;
  for (let i = 0; i < 4; i++) {
    if (buf[p++] !== MAGIC[i]) throw new Error('NOT_CRYPTOIMG_V5');
  }
  const version = buf[p++];
  const flags = buf[p++];
  const kdfId = buf[p++];
  const cipherId = buf[p++];
  const eccId = buf[p++];
  const dataType = buf[p++];
  const compressionId = buf[p++];
  const saltLen = buf[p++];
  const nonceLen = buf[p++];
  const tagLen = buf[p++];
  const mem = readU32(buf, p); p += 4;
  const iter = readU32(buf, p); p += 4;
  const par = buf[p++];
  const payloadLen = readU64(buf, p); p += 8;
  return {
    version, flags, kdfId, cipherId, eccId, dataType, compressionId,
    saltLen, nonceLen, tagLen,
    argon2Memory: mem, argon2Iterations: iter, argon2Parallelism: par,
    payloadLen
  };
}

export function assembleEnvelope(
  aadHeader: Uint8Array,
  salt: Uint8Array,
  nonce: Uint8Array,
  ciphertext: Uint8Array,
  tag: Uint8Array
): Uint8Array {
  const total = aadHeader.length + salt.length + nonce.length + ciphertext.length + tag.length;
  const out = new Uint8Array(total);
  let p = 0;
  out.set(aadHeader, p); p += aadHeader.length;
  out.set(salt, p); p += salt.length;
  out.set(nonce, p); p += nonce.length;
  out.set(ciphertext, p); p += ciphertext.length;
  out.set(tag, p); p += tag.length;
  return trackSecretBuffer(out);
}

export function splitEnvelope(buf: Uint8Array) {
  const hdr = parseAadHeader(buf);
  let p = HEADER_AAD_SIZE;
  const salt = buf.subarray(p, p + hdr.saltLen); p += hdr.saltLen;
  const nonce = buf.subarray(p, p + hdr.nonceLen); p += hdr.nonceLen;
  const ciphertext = buf.subarray(p, p + hdr.payloadLen); p += hdr.payloadLen;
  const tag = buf.subarray(p, p + hdr.tagLen); p += hdr.tagLen;
  const aad = buf.subarray(0, HEADER_AAD_SIZE);
  return { header: hdr, salt, nonce, ciphertext, tag, aad };
}

// ============================================================================
// CHUNK RECORD FORMAT (Album Mode — v5.2)
// Format: "CHK1" (4) + chunkIndex (2) + totalChunks (2) + fileNameLen (2) +
//         fileName + fileSize (8) + fileSha256 (32) + chunkData
// This is the plaintext that gets compressed + encrypted + RS-armored per image.
// ============================================================================
const CHUNK_MAGIC = [0x43, 0x48, 0x4B, 0x31]; // "CHK1"

export interface ChunkInfo {
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  fileSize: number;
  fileSha256: Uint8Array;
  chunkData: Uint8Array;
}

export function buildChunkRecord(info: ChunkInfo): Uint8Array {
  const nameBytes = utf8ToBytes(info.fileName);
  const recordLen = 4 + 2 + 2 + 2 + nameBytes.length + 8 + 32 + info.chunkData.length;
  const record = trackSecretBuffer(new Uint8Array(recordLen));
  let p = 0;
  record[p++] = CHUNK_MAGIC[0]; record[p++] = CHUNK_MAGIC[1]; record[p++] = CHUNK_MAGIC[2]; record[p++] = CHUNK_MAGIC[3];
  record[p++] = (info.chunkIndex >> 8) & 0xFF; record[p++] = info.chunkIndex & 0xFF;
  record[p++] = (info.totalChunks >> 8) & 0xFF; record[p++] = info.totalChunks & 0xFF;
  record[p++] = (nameBytes.length >> 8) & 0xFF; record[p++] = nameBytes.length & 0xFF;
  record.set(nameBytes, p); p += nameBytes.length;
  p = writeU64(record, p, info.fileSize);
  record.set(info.fileSha256, p); p += 32;
  record.set(info.chunkData, p);
  return record;
}

export function parseChunkRecord(data: Uint8Array): ChunkInfo {
  let p = 0;
  if (data[p] !== CHUNK_MAGIC[0] || data[p+1] !== CHUNK_MAGIC[1] ||
      data[p+2] !== CHUNK_MAGIC[2] || data[p+3] !== CHUNK_MAGIC[3]) {
    throw new Error('NOT_CHUNK_RECORD');
  }
  p += 4;
  const chunkIndex = (data[p] << 8) | data[p + 1]; p += 2;
  const totalChunks = (data[p] << 8) | data[p + 1]; p += 2;
  const nameLen = (data[p] << 8) | data[p + 1]; p += 2;
  const fileName = bytesToUtf8(data.subarray(p, p + nameLen)); p += nameLen;
  const fileSize = readU64(data, p); p += 8;
  const fileSha256 = data.subarray(p, p + 32); p += 32;
  const chunkData = data.subarray(p);
  return { chunkIndex, totalChunks, fileName, fileSize, fileSha256, chunkData };
}

export function isChunkRecord(data: Uint8Array): boolean {
  return data.length >= 4 &&
    data[0] === CHUNK_MAGIC[0] && data[1] === CHUNK_MAGIC[1] &&
    data[2] === CHUNK_MAGIC[2] && data[3] === CHUNK_MAGIC[3];
}

export function isFileRecord(data: Uint8Array): boolean {
  return data.length >= 4 &&
    data[0] === 0x46 && data[1] === 0x49 && data[2] === 0x4C && data[3] === 0x45; // "FILE"
}

export function buildRsArmored(
  envelopeBytes: Uint8Array,
  dataType: number,
  compressionId: number,
  argon2Params: Argon2Params
): Uint8Array {
  const numChunks = Math.ceil(envelopeBytes.length / RS_CHUNK_DATA);
  const lastChunkDataLen = envelopeBytes.length - (numChunks - 1) * RS_CHUNK_DATA;
  const armored = new Uint8Array(numChunks * RS_CHUNK_TOTAL);

  for (let c = 0; c < numChunks; c++) {
    const chunkData = new Uint8Array(RS_CHUNK_DATA);
    const start = c * RS_CHUNK_DATA;
    chunkData.set(envelopeBytes.subarray(start, Math.min(start + RS_CHUNK_DATA, envelopeBytes.length)), 0);
    const encoded = rsEncodeChunk(chunkData);
    for (let i = 0; i < RS_CHUNK_TOTAL; i++) {
      armored[c * RS_CHUNK_TOTAL + i] = encoded[i] & 0xFF;
    }
  }

  const finalPayload = new Uint8Array(RS_OUTER_HEADER_SIZE + armored.length);
  let p = 0;
  finalPayload[p++] = MAGIC[0]; finalPayload[p++] = MAGIC[1]; finalPayload[p++] = MAGIC[2]; finalPayload[p++] = MAGIC[3];
  p = writeU32(finalPayload, p, numChunks);
  finalPayload[p++] = lastChunkDataLen & 0xFF;
  finalPayload[p++] = dataType & 0xFF;
  finalPayload[p++] = compressionId & 0xFF;
  finalPayload[p++] = 0; // reserved
  p = writeU32(finalPayload, p, argon2Params.memory);
  p = writeU32(finalPayload, p, argon2Params.iterations);
  finalPayload[p++] = argon2Params.parallelism & 0xFF;
  finalPayload.set(armored, p);

  return finalPayload;
}

export function parseRsArmored(extractedBytes: Uint8Array) {
  if (extractedBytes.length < RS_OUTER_HEADER_SIZE) throw new Error('TOO_SHORT');
  let p = 0;
  for (let i = 0; i < 4; i++) {
    if (extractedBytes[p++] !== MAGIC[i]) throw new Error('NOT_CRYPTOIMG_V5');
  }
  const numChunks = readU32(extractedBytes, p); p += 4;
  const lastChunkDataLen = extractedBytes[p++];
  const dataType = extractedBytes[p++];
  const compressionId = extractedBytes[p++];
  p++; // reserved
  const argon2Memory = readU32(extractedBytes, p); p += 4;
  const argon2Iterations = readU32(extractedBytes, p); p += 4;
  const argon2Parallelism = extractedBytes[p++];

  if (numChunks === 0 || numChunks > 0xFFFFFFFF) throw new Error('INVALID_CHUNK_COUNT');
  if (lastChunkDataLen === 0 || lastChunkDataLen > RS_CHUNK_DATA) throw new Error('INVALID_LAST_CHUNK_LEN');
  if (argon2Memory < ARGON2_MIN_MEMORY || argon2Memory > ARGON2_MAX_MEMORY * 4) throw new Error('INVALID_ARGON2_PARAMS');
  if (argon2Iterations < 1 || argon2Iterations > 100) throw new Error('INVALID_ARGON2_PARAMS');

  const armoredSize = numChunks * RS_CHUNK_TOTAL;
  if (extractedBytes.length < RS_OUTER_HEADER_SIZE + armoredSize) throw new Error('TRUNCATED');

  const envelopeLen = (numChunks - 1) * RS_CHUNK_DATA + lastChunkDataLen;
  const envelope = new Uint8Array(envelopeLen);
  for (let c = 0; c < numChunks; c++) {
    const startIdx = RS_OUTER_HEADER_SIZE + c * RS_CHUNK_TOTAL;
    const decoded = rsDecodeChunk(extractedBytes.subarray(startIdx, startIdx + RS_CHUNK_TOTAL));
    const copyLen = (c === numChunks - 1) ? lastChunkDataLen : RS_CHUNK_DATA;
    for (let i = 0; i < copyLen; i++) {
      envelope[c * RS_CHUNK_DATA + i] = decoded[i];
    }
  }

  return {
    envelope: trackSecretBuffer(envelope),
    dataType,
    compressionId,
    argon2Params: { memory: argon2Memory, iterations: argon2Iterations, parallelism: argon2Parallelism }
  };
}

// ============================================================================
// STEGANOGRAPHY: PRNG, VARIANCE MAP, EMBED & EXTRACT
// ============================================================================
const VARIANCE_CHUNK = 50000;
export async function computeVarianceMap(pixelData: Uint8ClampedArray | Uint8Array, width: number, height: number) {
  const pixelCount = width * height;
  const variance = new Float32Array(pixelCount);
  let totalVariance = 0;

  let idx = 0;
  while (idx < pixelCount) {
    const end = Math.min(idx + VARIANCE_CHUNK, pixelCount);
    for (; idx < end; idx++) {
      const x = idx % width;
      const y = Math.floor(idx / width);
      let sum = 0, sumSq = 0, count = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nIdx = (ny * width + nx) * 4;
          // Upper 6 bits only so 2-LSB stego writes do NOT modify computed variance
          const r = pixelData[nIdx] & 0xFC;
          const g = pixelData[nIdx + 1] & 0xFC;
          const b = pixelData[nIdx + 2] & 0xFC;
          const lum = (r + g + b) / 3;
          sum += lum;
          sumSq += lum * lum;
          count++;
        }
      }

      const mean = sum / count;
      const v = sumSq / count - mean * mean;
      variance[idx] = v;
      totalVariance += v;
    }
    await sleep(0);
  }

  const meanVariance = totalVariance / pixelCount;
  return { variance, meanVariance };
}

export async function makeStegoPRNG(stegoKey: Uint8Array, pregenerateBytes: number) {
  const hmacKey = await crypto.subtle.importKey(
    'raw', stegoKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );

  const numChunks = Math.max(1, Math.ceil(pregenerateBytes / 32));
  const buffer = new Uint8Array(numChunks * 32);

  const BATCH = 512;
  for (let batch = 0; batch < numChunks; batch += BATCH) {
    const end = Math.min(batch + BATCH, numChunks);
    const promises: Promise<ArrayBuffer>[] = [];
    for (let i = batch; i < end; i++) {
      const counterBytes = new Uint8Array(8);
      new DataView(counterBytes.buffer).setUint32(0, i >>> 0, false);
      new DataView(counterBytes.buffer).setUint32(4, 0, false);
      promises.push(crypto.subtle.sign('HMAC', hmacKey, counterBytes));
    }
    const results = await Promise.all(promises);
    for (let i = 0; i < results.length; i++) {
      buffer.set(new Uint8Array(results[i]), (batch + i) * 32);
    }
  }

  let bufferIdx = 0;

  function nextBytesSync(n: number): Uint8Array {
    if (bufferIdx + n > buffer.length) {
      const out = new Uint8Array(n);
      for (let i = 0; i < n; i++) out[i] = buffer[(bufferIdx + i) % buffer.length];
      bufferIdx += n;
      return out;
    }
    const out = new Uint8Array(n);
    out.set(buffer.subarray(bufferIdx, bufferIdx + n), 0);
    bufferIdx += n;
    return out;
  }

  function nextUint32Sync(): number {
    const b = nextBytesSync(4);
    return ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
  }

  const SHUFFLE_CHUNK = 100000;
  async function shuffle(arr: Uint32Array): Promise<Uint32Array> {
    let i = arr.length - 1;
    while (i > 0) {
      const end = Math.max(0, i - SHUFFLE_CHUNK);
      for (; i > end; i--) {
        const j = nextUint32Sync() % (i + 1);
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      if (i > 0) await sleep(0);
    }
    return arr;
  }

  return { nextBytesSync, nextUint32Sync, shuffle };
}

export async function computePixelPermutation(pixelCount: number, stegoKey: Uint8Array): Promise<Uint32Array> {
  const needed = Math.max(32, (pixelCount - 1) * 4);
  const prng = await makeStegoPRNG(stegoKey, needed);
  const perm = new Uint32Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) perm[i] = i;
  await prng.shuffle(perm);
  return perm;
}

// ============================================================================
// CAPACITY ESTIMATION
// ============================================================================
/**
 * Estimate the real usable payload capacity (in bytes) for a given carrier image.
 * Accounts for: salt pixels, RS outer header, RS coding overhead, and variance
 * filtering (only ~50 % of pixels pass).
 */
export function estimateUsableCapacity(width: number, height: number): number {
  const pixelCount = width * height;
  const saltPixels = Math.ceil((SALT_BYTES * 8) / STEGO_BITS_PER_PIXEL);
  const headerPixels = Math.ceil((RS_OUTER_HEADER_SIZE * 8) / STEGO_BITS_PER_PIXEL);
  const availablePixels = pixelCount - saltPixels - headerPixels;
  // Only high-variance pixels carry the main payload
  const usablePayloadPixels = Math.floor(availablePixels * 0.5);
  const usablePayloadBits = usablePayloadPixels * STEGO_BITS_PER_PIXEL;
  // RS coding: each RS_CHUNK_TOTAL output bytes carry RS_CHUNK_DATA payload bytes
  const usableArmoredBytes = Math.floor(usablePayloadBits / 8);
  const usableEnvelopeBytes = Math.floor(usableArmoredBytes * (RS_CHUNK_DATA / RS_CHUNK_TOTAL));
  // Subtract envelope overhead: AAD header + salt + nonce + tag
  const envelopeOverhead = HEADER_AAD_SIZE + SALT_BYTES + NONCE_BYTES + TAG_BYTES;
  return Math.max(0, usableEnvelopeBytes - envelopeOverhead);
}

/**
 * Estimate the size of the final RS-armored payload (bytes) given the raw
 * plaintext length (after any file-record wrapping but before compression).
 */
export function estimateArmoredSize(plainBytesLen: number): number {
  // Worst-case: no compression benefit, plus encryption overhead
  const envelopeSize = HEADER_AAD_SIZE + SALT_BYTES + NONCE_BYTES + plainBytesLen + TAG_BYTES;
  const numChunks = Math.ceil(envelopeSize / RS_CHUNK_DATA);
  return RS_OUTER_HEADER_SIZE + numChunks * RS_CHUNK_TOTAL;
}

export function extractPayloadUnkeyed(pixelData: Uint8ClampedArray | Uint8Array, byteCount: number): Uint8Array {
  const bitsNeeded = byteCount * 8;
  const pixelsNeeded = Math.ceil(bitsNeeded / STEGO_BITS_PER_PIXEL);
  const bits = new Uint8Array(bitsNeeded);
  let bitIdx = 0;
  for (let p = 0; p < pixelsNeeded; p++) {
    const pxOffset = p * 4;
    const r = pixelData[pxOffset];
    const g = pixelData[pxOffset + 1];
    const b = pixelData[pxOffset + 2];
    if (bitIdx < bitsNeeded) bits[bitIdx++] = (r >> 1) & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = r & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = (g >> 1) & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = g & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = (b >> 1) & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = b & 1;
  }
  const out = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    let byteVal = 0;
    for (let j = 0; j < 8; j++) byteVal = (byteVal << 1) | (bits[i * 8 + j] || 0);
    out[i] = byteVal;
  }
  return out;
}

export async function embedPayloadWithSalt(
  pixelData: Uint8ClampedArray,
  width: number,
  height: number,
  salt: Uint8Array,
  armoredPayload: Uint8Array,
  stegoKey: Uint8Array
): Promise<{ ok: boolean; req: number; avail: number }> {
  const saltPixels = Math.ceil((salt.length * 8) / STEGO_BITS_PER_PIXEL);
  const saltBits = new Uint8Array(salt.length * 8);
  for (let i = 0; i < salt.length; i++) {
    for (let j = 0; j < 8; j++) saltBits[i * 8 + j] = (salt[i] >> (7 - j)) & 1;
  }

  let bitIdx = 0;
  for (let p = 0; p < saltPixels; p++) {
    const pxOffset = p * 4;
    const chunk = [0, 0, 0, 0, 0, 0];
    for (let j = 0; j < 6 && bitIdx < saltBits.length; j++) {
      chunk[j] = saltBits[bitIdx++];
    }
    pixelData[pxOffset] = (pixelData[pxOffset] & 0xFC) | (chunk[0] << 1) | chunk[1];
    pixelData[pxOffset + 1] = (pixelData[pxOffset + 1] & 0xFC) | (chunk[2] << 1) | chunk[3];
    pixelData[pxOffset + 2] = (pixelData[pxOffset + 2] & 0xFC) | (chunk[4] << 1) | chunk[5];
  }

  const { variance, meanVariance } = await computeVarianceMap(pixelData, width, height);

  const pixelCount = width * height;
  const perm = await computePixelPermutation(pixelCount, stegoKey);
  const startPixel = Math.floor((salt.length * 8) / STEGO_BITS_PER_PIXEL);

  const payloadBits = new Uint8Array(armoredPayload.length * 8);
  for (let i = 0; i < armoredPayload.length; i++) {
    for (let j = 0; j < 8; j++) payloadBits[i * 8 + j] = (armoredPayload[i] >> (7 - j)) & 1;
  }

  let permIdx = startPixel;

  const noFilterBits = RS_OUTER_HEADER_SIZE * 8;
  bitIdx = 0;
  while (bitIdx < noFilterBits && bitIdx < payloadBits.length) {
    if (permIdx >= perm.length) {
      return { ok: false, req: armoredPayload.length, avail: Math.floor((pixelCount - startPixel) * STEGO_BITS_PER_PIXEL / 8) };
    }
    const pxOffset = perm[permIdx++] * 4;
    const chunk = [0, 0, 0, 0, 0, 0];
    for (let j = 0; j < 6 && bitIdx < payloadBits.length; j++) {
      chunk[j] = payloadBits[bitIdx++];
    }
    pixelData[pxOffset] = (pixelData[pxOffset] & 0xFC) | (chunk[0] << 1) | chunk[1];
    pixelData[pxOffset + 1] = (pixelData[pxOffset + 1] & 0xFC) | (chunk[2] << 1) | chunk[3];
    pixelData[pxOffset + 2] = (pixelData[pxOffset + 2] & 0xFC) | (chunk[4] << 1) | chunk[5];
  }

  const EMBED_CHUNK = 50000;
  let sinceYield = 0;
  while (bitIdx < payloadBits.length) {
    if (permIdx >= perm.length) {
      return { ok: false, req: armoredPayload.length, avail: Math.floor((pixelCount - startPixel) * STEGO_BITS_PER_PIXEL / 8 * 0.5) };
    }
    const pixelIdx = perm[permIdx++];
    if (variance[pixelIdx] >= meanVariance) {
      const pxOffset = pixelIdx * 4;
      const chunk = [0, 0, 0, 0, 0, 0];
      for (let j = 0; j < 6 && bitIdx < payloadBits.length; j++) {
        chunk[j] = payloadBits[bitIdx++];
      }
      pixelData[pxOffset] = (pixelData[pxOffset] & 0xFC) | (chunk[0] << 1) | chunk[1];
      pixelData[pxOffset + 1] = (pixelData[pxOffset + 1] & 0xFC) | (chunk[2] << 1) | chunk[3];
      pixelData[pxOffset + 2] = (pixelData[pxOffset + 2] & 0xFC) | (chunk[4] << 1) | chunk[5];
    }
    if (++sinceYield >= EMBED_CHUNK) {
      sinceYield = 0;
      await sleep(0);
    }
  }

  return { ok: true, req: armoredPayload.length, avail: Math.floor(pixelCount * STEGO_BITS_PER_PIXEL / 8) };
}

export async function extractPayloadShifted(
  pixelData: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  byteCount: number,
  stegoKey: Uint8Array,
  skipBytes: number
): Promise<Uint8Array> {
  const pixelCount = width * height;
  const perm = await computePixelPermutation(pixelCount, stegoKey);
  const startPixel = Math.floor((skipBytes * 8) / STEGO_BITS_PER_PIXEL);

  const { variance, meanVariance } = await computeVarianceMap(pixelData, width, height);

  const bitsNeeded = byteCount * 8;
  const bits = new Uint8Array(bitsNeeded);
  let bitIdx = 0;
  let permIdx = startPixel;

  const noFilterBits = RS_OUTER_HEADER_SIZE * 8;
  while (bitIdx < noFilterBits && bitIdx < bitsNeeded) {
    if (permIdx >= perm.length) throw new Error('IMAGE_TOO_SMALL');
    const pxOffset = perm[permIdx++] * 4;
    const r = pixelData[pxOffset];
    const g = pixelData[pxOffset + 1];
    const b = pixelData[pxOffset + 2];
    if (bitIdx < bitsNeeded) bits[bitIdx++] = (r >> 1) & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = r & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = (g >> 1) & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = g & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = (b >> 1) & 1;
    if (bitIdx < bitsNeeded) bits[bitIdx++] = b & 1;
  }

  const EXTRACT_CHUNK = 50000;
  let sinceYield = 0;
  while (bitIdx < bitsNeeded) {
    if (permIdx >= perm.length) throw new Error('IMAGE_TOO_SMALL_ADAPTIVE');
    const pixelIdx = perm[permIdx++];
    if (variance[pixelIdx] >= meanVariance) {
      const pxOffset = pixelIdx * 4;
      const r = pixelData[pxOffset];
      const g = pixelData[pxOffset + 1];
      const b = pixelData[pxOffset + 2];
      if (bitIdx < bitsNeeded) bits[bitIdx++] = (r >> 1) & 1;
      if (bitIdx < bitsNeeded) bits[bitIdx++] = r & 1;
      if (bitIdx < bitsNeeded) bits[bitIdx++] = (g >> 1) & 1;
      if (bitIdx < bitsNeeded) bits[bitIdx++] = g & 1;
      if (bitIdx < bitsNeeded) bits[bitIdx++] = (b >> 1) & 1;
      if (bitIdx < bitsNeeded) bits[bitIdx++] = b & 1;
    }
    if (++sinceYield >= EXTRACT_CHUNK) {
      sinceYield = 0;
      await sleep(0);
    }
  }

  const out = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    let byteVal = 0;
    for (let j = 0; j < 8; j++) byteVal = (byteVal << 1) | (bits[i * 8 + j] || 0);
    out[i] = byteVal;
  }
  return out;
}

// ============================================================================
// v4 LEGACY DECODER
// ============================================================================
export async function decodeV4Legacy(
  pixelData: Uint8ClampedArray | Uint8Array,
  pin: string
): Promise<DecodedResult> {
  const maxBytes = Math.floor(pixelData.length / 4);
  if (maxBytes < 8) throw new Error('IMG_SMALL');

  const extractedBytes = new Uint8Array(maxBytes);
  for (let i = 0; i < maxBytes; i++) {
    extractedBytes[i] = ((pixelData[i * 4] & 0x0F) << 4) | (pixelData[i * 4 + 1] & 0x0F);
  }

  if (
    extractedBytes[0] !== MAGIC_V4[0] ||
    extractedBytes[1] !== MAGIC_V4[1] ||
    extractedBytes[2] !== MAGIC_V4[2] ||
    extractedBytes[3] !== MAGIC_V4[3]
  ) {
    throw new Error('NOT_CRYPTOIMG_V4');
  }

  const numChunks = extractedBytes[4];
  const lastChunkDataLen = extractedBytes[5];
  const dataType = extractedBytes[6];

  if (numChunks === 0 || lastChunkDataLen === 0 || lastChunkDataLen > RS_CHUNK_DATA) {
    throw new Error('INVALID_V4_HEADER');
  }

  const rawCryptoBytes = new Uint8Array((numChunks - 1) * RS_CHUNK_DATA + lastChunkDataLen);
  for (let c = 0; c < numChunks; c++) {
    const startIdx = 8 + c * RS_CHUNK_TOTAL;
    const decoded = rsDecodeChunk(extractedBytes.subarray(startIdx, startIdx + RS_CHUNK_TOTAL));
    const copyLen = (c === numChunks - 1) ? lastChunkDataLen : RS_CHUNK_DATA;
    for (let i = 0; i < copyLen; i++) rawCryptoBytes[c * RS_CHUNK_DATA + i] = decoded[i];
  }

  const saltBytes = rawCryptoBytes.subarray(0, 16);
  const ivBytes = rawCryptoBytes.subarray(16, 32);
  const cipherBytes = rawCryptoBytes.subarray(32);

  const keyRaw = await argon2id({
    password: pin,
    salt: saltBytes,
    parallelism: ARGON2_V4_PARALLELISM,
    iterations: ARGON2_V4_ITERATIONS,
    memorySize: ARGON2_V4_MEMORY,
    hashLength: ARGON2_HASH_LENGTH,
    outputType: 'binary'
  });
  const keyUint8 = trackSecretBuffer(new Uint8Array(keyRaw));

  const key = await crypto.subtle.importKey('raw', keyUint8, { name: 'AES-CBC' }, false, ['decrypt']);
  let plainBuffer: ArrayBuffer;
  try {
    plainBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: ivBytes }, key, cipherBytes);
  } catch {
    throw new Error('DECRYPT_FAILED_V4');
  }
  const plainBytes = trackSecretBuffer(new Uint8Array(plainBuffer));

  if (dataType === DATA_TYPE_TEXT) {
    return {
      dataType: DATA_TYPE_TEXT,
      text: bytesToUtf8(plainBytes),
      isV4Legacy: true,
      sha256Verified: true
    };
  } else {
    let q = 0;
    const fileNameLen = (plainBytes[q] << 8) | plainBytes[q + 1]; q += 2;
    if (fileNameLen > plainBytes.length - 2) throw new Error('BAD_V4_FILE_RECORD');
    const fileName = bytesToUtf8(plainBytes.subarray(q, q + fileNameLen)); q += fileNameLen;
    const fileContent = plainBytes.subarray(q);

    return {
      dataType: DATA_TYPE_FILE,
      fileName,
      fileSize: fileContent.length,
      fileBlob: new Blob([fileContent], { type: 'application/octet-stream' }),
      isV4Legacy: true,
      sha256Verified: true
    };
  }
}
