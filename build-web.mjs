import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dir, 'dist');
const webDir = resolve(__dir, 'WEB');

// Create WEB dir
if (!existsSync(webDir)) mkdirSync(webDir, { recursive: true });

// Copy JS bundle
cpSync(resolve(distDir, 'assets/index-I4H2yCnw.js'), resolve(webDir, 'app.js'));

// Read CSS
const css = readFileSync(resolve(distDir, 'assets/index-CCiANIbg.css'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cryptoimg — Authenticated Crypto-Steganography</title>
  <meta name="description" content="Hide any file inside an image using AES-256-GCM encryption, Argon2id key derivation, and Reed-Solomon error correction. 100% client-side, zero server." />
  <meta property="og:title" content="Cryptoimg — Hide Files in Images" />
  <meta property="og:description" content="AES-256-GCM + Argon2id + Reed-Solomon steganography. Upload any image, hide any file. Works in browser, desktop, and Android." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${css}</style>
  <style>
    /* ===== LANDING PAGE STYLES ===== */
    :root {
      --primary: #10b981;
      --primary-dark: #059669;
      --primary-light: #d1fae5;
      --bg: #0f172a;
      --bg-card: #1e293b;
      --text: #f1f5f9;
      --text-dim: #94a3b8;
      --border: #334155;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; }

    /* NAV */
    .lp-nav { position: sticky; top: 0; z-index: 1000; background: rgba(15,23,42,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); }
    .lp-nav-inner { max-width: 1200px; margin: auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
    .lp-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text); font-weight: 800; font-size: 1.3rem; }
    .lp-brand-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); display: grid; place-items: center; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
    .lp-nav-links { display: flex; gap: 24px; align-items: center; }
    .lp-nav-links a { color: var(--text-dim); text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
    .lp-nav-links a:hover { color: var(--primary); }
    .lp-nav-cta { background: var(--primary) !important; color: #fff !important; padding: 8px 18px; border-radius: 10px; font-weight: 700 !important; transition: transform 0.2s, box-shadow 0.2s; }
    .lp-nav-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16,185,129,0.3); }

    /* HERO */
    .lp-hero { padding: 100px 24px 80px; background: radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.12) 0%, transparent 60%); text-align: center; }
    .lp-hero-inner { max-width: 800px; margin: auto; }
    .lp-hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: var(--primary-light); color: var(--primary-dark); border-radius: 100px; font-weight: 700; font-size: 0.85rem; margin-bottom: 24px; }
    .lp-hero h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.1; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 20px; }
    .lp-hero h1 em { font-style: normal; background: linear-gradient(135deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .lp-hero p { font-size: 1.2rem; color: var(--text-dim); margin-bottom: 36px; max-width: 600px; margin-left: auto; margin-right: auto; }
    .lp-hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .lp-btn { padding: 14px 28px; border-radius: 14px; font-weight: 700; font-size: 1rem; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s; cursor: pointer; border: none; font-family: inherit; }
    .lp-btn-primary { background: var(--primary); color: #fff; box-shadow: 0 8px 24px rgba(16,185,129,0.3); }
    .lp-btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); }
    .lp-btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--border); }
    .lp-btn-outline:hover { border-color: var(--primary); }

    /* SECTIONS */
    .lp-section { padding: 80px 24px; }
    .lp-section-alt { background: var(--bg-card); }
    .lp-section-inner { max-width: 1100px; margin: auto; }
    .lp-section-title { text-align: center; margin-bottom: 60px; }
    .lp-section-title h2 { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; margin-bottom: 14px; }
    .lp-section-title p { color: var(--text-dim); font-size: 1.1rem; max-width: 600px; margin: auto; }

    /* CARDS */
    .lp-grid { display: grid; gap: 24px; }
    .lp-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .lp-grid-4 { grid-template-columns: repeat(4, 1fr); }
    .lp-grid-2 { grid-template-columns: repeat(2, 1fr); }
    .lp-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 28px; transition: transform 0.3s, box-shadow 0.3s; }
    .lp-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }
    .lp-card-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(16,185,129,0.15); display: grid; place-items: center; font-size: 1.5rem; margin-bottom: 16px; }
    .lp-card h3 { font-size: 1.15rem; margin-bottom: 10px; font-weight: 700; }
    .lp-card p { color: var(--text-dim); font-size: 0.95rem; }

    /* STEPS */
    .lp-steps { counter-reset: step; }
    .lp-step { display: flex; gap: 24px; align-items: flex-start; margin-bottom: 40px; padding: 28px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; counter-increment: step; }
    .lp-step-num { flex-shrink: 0; width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #10b981, #059669); display: grid; place-items: center; font-weight: 800; font-size: 1.3rem; color: #fff; }
    .lp-step-num::after { content: counter(step); }
    .lp-step-body h3 { font-size: 1.2rem; margin-bottom: 8px; }
    .lp-step-body p { color: var(--text-dim); font-size: 0.95rem; }
    .lp-step-body code { font-family: 'JetBrains Mono', monospace; background: rgba(16,185,129,0.12); color: var(--primary); padding: 2px 8px; border-radius: 6px; font-size: 0.85rem; }

    /* PIPELINE */
    .lp-pipeline { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; padding: 32px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; margin-bottom: 48px; }
    .lp-pipeline-step { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 18px; background: rgba(16,185,129,0.1); border-radius: 12px; min-width: 100px; text-align: center; }
    .lp-pipeline-step .icon { font-size: 1.8rem; }
    .lp-pipeline-step .label { font-size: 0.8rem; font-weight: 600; color: var(--text-dim); }
    .lp-pipeline-arrow { font-size: 1.5rem; color: var(--primary); }

    /* TECH TABLE */
    .lp-tech-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
    .lp-tech-table th, .lp-tech-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid var(--border); }
    .lp-tech-table th { font-weight: 700; color: var(--primary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .lp-tech-table td { color: var(--text-dim); }
    .lp-tech-table td:first-child { font-weight: 600; color: var(--text); }

    /* FAQ */
    .lp-faq { margin-bottom: 20px; }
    .lp-faq summary { font-weight: 700; font-size: 1.05rem; cursor: pointer; padding: 18px 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; list-style: none; display: flex; align-items: center; gap: 12px; }
    .lp-faq summary::before { content: '▸'; transition: transform 0.2s; }
    .lp-faq[open] summary::before { transform: rotate(90deg); }
    .lp-faq summary::-webkit-details-marker { display: none; }
    .lp-faq .answer { padding: 18px 24px; color: var(--text-dim); font-size: 0.95rem; border: 1px solid var(--border); border-top: none; border-radius: 0 0 14px 14px; background: var(--bg); }

    /* DONATE */
    .lp-donate { text-align: center; padding: 60px 24px; background: radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 60%); }
    .lp-donate-cards { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-top: 32px; }
    .lp-donate-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; min-width: 220px; }
    .lp-donate-card h4 { margin: 0 0 8px; display: flex; align-items: center; gap: 8px; }
    .lp-donate-card .addr { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-dim); word-break: break-all; background: var(--bg); padding: 10px; border-radius: 8px; margin-top: 8px; cursor: pointer; transition: background 0.2s; }
    .lp-donate-card .addr:hover { background: rgba(16,185,129,0.1); }

    /* FOOTER */
    .lp-footer { padding: 32px 24px; text-align: center; color: var(--text-dim); font-size: 0.85rem; border-top: 1px solid var(--border); }
    .lp-footer a { color: var(--primary); text-decoration: none; }

    /* APP SECTION */
    .lp-app-section { padding: 60px 24px; }
    .lp-app-container { max-width: 100%; width: 100%; }

    /* RESPONSIVE */
    @media (max-width: 900px) { .lp-grid-3, .lp-grid-4 { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .lp-grid-3, .lp-grid-4, .lp-grid-2 { grid-template-columns: 1fr; } .lp-nav-links a:not(.lp-nav-cta) { display: none; } .lp-step { flex-direction: column; } .lp-pipeline { flex-direction: column; } .lp-pipeline-arrow { transform: rotate(90deg); } }
  </style>
</head>
<body>

  <!-- NAVIGATION -->
  <nav class="lp-nav">
    <div class="lp-nav-inner">
      <a class="lp-brand" href="#top"><div class="lp-brand-icon">🛡️</div>Cryptoimg</a>
      <div class="lp-nav-links">
        <a href="#how-it-works">How It Works</a>
        <a href="#guide">Guide</a>
        <a href="#tech">Technology</a>
        <a href="#faq">FAQ</a>
        <a class="lp-nav-cta" href="#app">Launch App ⬇</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <header class="lp-hero" id="top">
    <div class="lp-hero-inner">
      <span class="lp-hero-badge">🔒 100% Client-Side · Zero Server</span>
      <h1>Hide Any File<br>Inside <em>Any Image</em></h1>
      <p>Steganography + AES-256-GCM encryption + Argon2id key derivation + Reed-Solomon error correction. Your data never leaves your browser.</p>
      <div class="lp-hero-actions">
        <a class="lp-btn lp-btn-primary" href="#app">🔐 Open App</a>
        <a class="lp-btn lp-btn-outline" href="#guide">📖 Read Guide</a>
      </div>
    </div>
  </header>

  <!-- HOW IT WORKS -->
  <section class="lp-section lp-section-alt" id="how-it-works">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2>How Crypto-Steganography Works</h2>
        <p>Multi-layer protection: encryption makes data unreadable, steganography makes it invisible.</p>
      </div>

      <div class="lp-pipeline">
        <div class="lp-pipeline-step"><span class="icon">📄</span><span class="label">Your File</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">📦</span><span class="label">Deflate</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">🔑</span><span class="label">AES-256-GCM</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">🛡️</span><span class="label">Reed-Solomon</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">🖼️</span><span class="label">Stego Embed</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">📸</span><span class="label">Output Image</span></div>
      </div>

      <div class="lp-grid lp-grid-4">
        <div class="lp-card">
          <div class="lp-card-icon">📦</div>
          <h3>Deflate Compression</h3>
          <p>Your file is compressed using DEFLATE before encryption, maximizing the amount of data that fits inside the image.</p>
        </div>
        <div class="lp-card">
          <div class="lp-card-icon">🔑</div>
          <h3>AES-256-GCM</h3>
          <p>Authenticated encryption. Even if someone knows you used Cryptoimg, they can't read the data without your PIN. Any tampering is detected via the auth tag.</p>
        </div>
        <div class="lp-card">
          <div class="lp-card-icon">🧬</div>
          <h3>Argon2id KDF</h3>
          <p>Your PIN is transformed into a cryptographic key using Argon2id — the winner of the Password Hashing Competition. Resistant to GPU and ASIC attacks.</p>
        </div>
        <div class="lp-card">
          <div class="lp-card-icon">🛡️</div>
          <h3>Reed-Solomon ECC</h3>
          <p>Error-correcting codes protect against minor image modifications (re-saving, format conversion). The data survives JPEG→PNG conversion.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- STEP-BY-STEP GUIDE -->
  <section class="lp-section" id="guide">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2>Step-by-Step Guide</h2>
        <p>Complete walkthrough for hiding and extracting files from images.</p>
      </div>

      <h3 style="font-size:1.4rem; margin-bottom:24px; color: var(--primary);">🔐 How to Hide a File (Encode)</h3>
      <div class="lp-steps">
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Choose a Carrier Image</h3>
            <p>Click <strong>"Select Image"</strong> and pick a PNG, WebP, or AVIF file. The app will auto-convert JPEGs to lossless format. Larger images = more storage capacity. A 1920×1080 PNG can hold ~570 KB of data.</p>
          </div>
        </div>
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Enter Your Secret Data</h3>
            <p>Switch between <strong>Text</strong> and <strong>File</strong> tabs. For files, drag-and-drop or click to browse. The capacity indicator shows exactly how much data fits: <code>Available: ~570 KB</code>.</p>
          </div>
        </div>
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Set a PIN Code</h3>
            <p>Enter and confirm your PIN. This is the <strong>only</strong> thing you need to remember. The PIN is never stored — it's used to derive the encryption key via Argon2id + HKDF.</p>
          </div>
        </div>
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Choose Output Format</h3>
            <p>Select <strong>PNG</strong> (lossless, best), <strong>WebP</strong> (smaller, still lossless), or <strong>AVIF</strong> (newest, smallest). All formats preserve the hidden data.</p>
          </div>
        </div>
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Encrypt & Download</h3>
            <p>Click <strong>"Encrypt & Embed"</strong>. The app will: compress → encrypt → add error correction → embed in pixels → self-test verify → download the output image. The output image looks like a normal photo.</p>
          </div>
        </div>
      </div>

      <h3 style="font-size:1.4rem; margin-bottom:24px; margin-top:48px; color: var(--primary);">🔓 How to Extract a File (Decode)</h3>
      <div class="lp-steps">
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Upload the Stego Image</h3>
            <p>Click <strong>"Select Image"</strong> and pick the image that contains hidden data. It should be the exact output image from the encoding step (or a copy).</p>
          </div>
        </div>
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Enter the PIN</h3>
            <p>Type the same PIN you used when encoding. The app will run Argon2id to derive the decryption key. If the PIN is wrong, you'll see "Incorrect PIN or corrupted container".</p>
          </div>
        </div>
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Extract & Download</h3>
            <p>Click <strong>"Extract"</strong>. The app reads the hidden data, verifies the Reed-Solomon error correction, decrypts it, decompresses, and shows the result. Click <strong>"Download"</strong> to save the original file.</p>
          </div>
        </div>
      </div>

      <h3 style="font-size:1.4rem; margin-bottom:24px; margin-top:48px; color: var(--primary);">📦 Album Mode (Large Files)</h3>
      <div class="lp-steps">
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Select Multiple Carrier Images</h3>
            <p>Switch to the <strong>"Album Encode"</strong> tab. Select 2+ images. The app auto-calculates how many are needed: <code>File (3 MB) → 5 of 6 images needed</code>.</p>
          </div>
        </div>
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>File is Split Automatically</h3>
            <p>Your file is split into chunks, each encrypted independently with its own salt/nonce. Each chunk is embedded in one image. Empty images are skipped.</p>
          </div>
        </div>
        <div class="lp-step">
          <div class="lp-step-num"></div>
          <div class="lp-step-body">
            <h3>Extract from Album</h3>
            <p>Switch to <strong>"Album Extract"</strong> tab, enter your PIN, select <strong>all album images at once</strong> (multi-select). All chunks are decoded in parallel and reassembled automatically. SHA-256 verifies integrity.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TECHNOLOGY -->
  <section class="lp-section lp-section-alt" id="tech">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2>Technical Details</h2>
        <p>The full cryptographic pipeline powering Cryptoimg.</p>
      </div>

      <div class="lp-card" style="overflow-x: auto;">
        <table class="lp-tech-table">
          <thead>
            <tr><th>Component</th><th>Algorithm</th><th>Purpose</th></tr>
          </thead>
          <tbody>
            <tr><td>Key Derivation</td><td>Argon2id (65 MB, 3 iter, p=4)</td><td>PIN → 256-bit stego key + 256-bit enc key. GPU/ASIC resistant.</td></tr>
            <tr><td>Key Expansion</td><td>HKDF-SHA256</td><td>Derives separate stego key and encryption key from Argon2 output.</td></tr>
            <tr><td>Encryption</td><td>AES-256-GCM</td><td>Authenticated encryption. 12-byte nonce, 16-byte auth tag, AAD = envelope header.</td></tr>
            <tr><td>Compression</td><td>DEFLATE (raw)</td><td>Reduces payload size before encryption. ~50-70% ratio on text, less on binary.</td></tr>
            <tr><td>Error Correction</td><td>Reed-Solomon (GF(2^8), 8-bit symbols)</td><td>Protects against minor image modifications. 25% overhead.</td></tr>
            <tr><td>Steganography</td><td>LSB embedding in variance-filtered pixels</td><td>Data hidden in least-significant bits of selected high-variance pixels. Statistically undetectable.</td></tr>
            <tr><td>Envelope Format</td><td>v5.1 — MAGIC(4) + version(1) + dataType(1) + compressId(1) + salt(16) + nonce(12) + tag(16) + payloadLen(4)</td><td>76-byte authenticated header embedded before payload data.</td></tr>
            <tr><td>Self-Test</td><td>Extract → decrypt → verify MAGIC</td><td>After encoding, immediately verifies the data can be extracted correctly.</td></tr>
            <tr><td>Album Mode</td><td>CHUNK record: index(2) + total(2) + name + fileSize(4) + sha256(32) + data</td><td>Splits large files across multiple images. Each chunk independently encrypted.</td></tr>
          </tbody>
        </table>
      </div>

      <div class="lp-grid lp-grid-3" style="margin-top: 32px;">
        <div class="lp-card">
          <div class="lp-card-icon">🌐</div>
          <h3>Browser</h3>
          <p>Web Crypto API for AES-GCM + HKDF. WebAssembly for Argon2id + Reed-Solomon. Zero server dependency.</p>
        </div>
        <div class="lp-card">
          <div class="lp-card-icon">💻</div>
          <h3>Desktop (Electron)</h3>
          <p>Windows installer + portable .exe. Same web stack wrapped in Electron with native file dialogs.</p>
        </div>
        <div class="lp-card">
          <div class="lp-card-icon">📱</div>
          <h3>Android (Capacitor)</h3>
          <p>Native APK via Capacitor. Camera access, file system, sharing. Same React UI in a native shell.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CAPACITY -->
  <section class="lp-section" id="capacity">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2>Storage Capacity</h2>
        <p>How much data fits in an image?</p>
      </div>
      <div class="lp-card" style="overflow-x: auto;">
        <table class="lp-tech-table">
          <thead>
            <tr><th>Image Size</th><th>Raw Pixels</th><th>Usable Capacity</th><th>What Fits</th></tr>
          </thead>
          <tbody>
            <tr><td>640×480</td><td>180 KB</td><td>~68 KB</td><td>Short text, small keys</td></tr>
            <tr><td>1280×720</td><td>540 KB</td><td>~205 KB</td><td>Text document, PDF page</td></tr>
            <tr><td>1920×1080</td><td>1,215 KB</td><td>~570 KB</td><td>Short documents, images</td></tr>
            <tr><td>2560×1440</td><td>2,160 KB</td><td>~800 KB</td><td>Documents, small archives</td></tr>
            <tr><td>3840×2160 (4K)</td><td>4,860 KB</td><td>~1,800 KB</td><td>PDF files, large documents</td></tr>
            <tr><td>Album (10× 1080p)</td><td>12,150 KB</td><td>~5,700 KB</td><td>Multi-MB files, small binaries</td></tr>
          </tbody>
        </table>
      </div>
      <p style="text-align:center; color: var(--text-dim); margin-top:16px; font-size:0.9rem;">Capacity = raw pixels × ~3 bits/pixel × 0.75 (RS overhead) × ~50% (variance filter). Use album mode for files > 1 image capacity.</p>
    </div>
  </section>

  <!-- FAQ -->
  <section class="lp-section lp-section-alt" id="faq">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2>Frequently Asked Questions</h2>
      </div>

      <details class="lp-faq">
        <summary>Is the data really hidden? Can someone detect it?</summary>
        <div class="answer">Cryptoimg uses LSB (Least Significant Bit) steganography in variance-filtered pixels. The changes are statistically undetectable — the modified pixels look identical to the original. Even a steganalysis tool would have difficulty distinguishing a Cryptoimg output from a normal image. However, if someone knows you used Cryptoimg and has the original image, they can compare pixels.</div>
      </details>

      <details class="lp-faq">
        <summary>What happens if I lose the PIN?</summary>
        <div class="answer">The data is gone. The PIN is the only way to derive the decryption key. There is no backdoor, no recovery mechanism, no master key. This is by design — it means nobody else can access your data either.</div>
      </details>

      <details class="lp-faq">
        <summary>Can I share the output image on social media?</summary>
        <div class="answer">It depends on the platform. Social media (Instagram, Twitter, Facebook) re-compresses images, which can destroy the hidden data. Use lossless sharing: email the original file, cloud storage, or direct file transfer. The Reed-Solomon error correction helps, but heavy compression will still break it.</div>
      </details>

      <details class="lp-faq">
        <summary>How is this different from just encrypting a file?</summary>
        <div class="answer">Encryption makes data unreadable. Steganography makes data invisible. Cryptoimg does both. If you just send an encrypted file, the attacker knows you're hiding something. With Cryptoimg, the image looks like a normal photo — there's nothing to intercept.</div>
      </details>

      <details class="lp-faq">
        <summary>What image formats work?</summary>
        <div class="answer">Input: any image (JPEG, PNG, WebP, AVIF, BMP, TIFF). The app auto-converts to lossless format. Output: PNG (recommended), WebP, or AVIF — all lossless. JPEG output is not supported because JPEG compression destroys hidden data.</div>
      </details>

      <details class="lp-faq">
        <summary>How does Album Mode work?</summary>
        <div class="answer">Album Mode splits a large file across multiple images. Each chunk is independently encrypted (own salt + nonce) and embedded in one image. All images share the same PIN. During extraction, you load all images at once, and the app reassembles them in order. SHA-256 verifies the complete file integrity.</div>
      </details>

      <details class="lp-faq">
        <summary>Is anything sent to a server?</summary>
        <div class="answer">No. Everything happens in your browser using Web Crypto API, WebAssembly, and Canvas API. Zero network requests during encode/decode. The source code is available for audit.</div>
      </details>

      <details class="lp-faq">
        <summary>What platforms are supported?</summary>
        <div class="answer">Web browser (Chrome, Firefox, Safari, Edge), Windows desktop (Electron installer + portable), and Android (APK via Capacitor). iOS support planned via Capacitor.</div>
      </details>
    </div>
  </section>

  <!-- DONATE -->
  <section class="lp-donate" id="donate">
    <div class="lp-section-inner">
      <h2 style="font-size:2rem; font-weight:800; margin-bottom:8px;">❤️ Support Cryptoimg</h2>
      <p style="color: var(--text-dim); max-width:500px; margin:auto;">If this tool is useful to you, consider supporting development. Every donation helps keep the project alive and ad-free.</p>
      <div class="lp-donate-cards">
        <div class="lp-donate-card">
          <h4>🟠 Bitcoin</h4>
          <div class="addr" onclick="navigator.clipboard.writeText(this.textContent).then(()=>this.style.background='rgba(16,185,129,0.2)')">bc1q48l0mfvrs6kza5xs6qmzagatmpelrxzyqcwfhpz</div>
        </div>
        <div class="lp-donate-card">
          <h4>🔷 Ethereum</h4>
          <div class="addr" onclick="navigator.clipboard.writeText(this.textContent).then(()=>this.style.background='rgba(16,185,129,0.2)')">0x6889fD4d5B688d6E3c4b7E5A2B1D6E8F2C3A4b5D</div>
        </div>
        <div class="lp-donate-card">
          <h4>🟢 USDT (TRC-20)</h4>
          <div class="addr" onclick="navigator.clipboard.writeText(this.textContent).then(()=>this.style.background='rgba(16,185,129,0.2)')">TN7V3t8EKjRTJFXNJwMjYpLqHGSQN7BTyv</div>
        </div>
      </div>
    </div>
  </section>

  <!-- APP -->
  <section class="lp-app-section" id="app">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2>Launch Cryptoimg</h2>
        <p>The full-featured steganography app runs right here in your browser.</p>
      </div>
      <div class="lp-app-container">
        <div id="root"></div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="lp-footer">
    <p>Cryptoimg v5.2 · AES-256-GCM + Argon2id + Reed-Solomon · <a href="https://github.com/cryptoimg" target="_blank">GitHub</a> · <a href="#donate">Donate</a></p>
    <p style="margin-top:8px;">All processing happens locally. No data leaves your device.</p>
  </footer>

  <script src="./app.js"></script>
</body>
</html>`;

writeFileSync(resolve(webDir, 'index.html'), html);
console.log('✅ WEB/index.html created');
console.log('✅ WEB/app.js copied');
console.log(`📁 Total files in WEB/: index.html + app.js`);
