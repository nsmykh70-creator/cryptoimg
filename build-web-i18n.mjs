import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dir, 'dist/assets/index-CCiANIbg.css'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
  <meta name="theme-color" content="#059669" />
  <title>Cryptoimg — Crypto-Steganography</title>
  <meta name="description" content="AES-256-GCM + Argon2id + Reed-Solomon steganography. Hide any file inside any image. 100% client-side." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${css}</style>
  <style>
    :root{--primary:#10b981;--primary-dark:#059669;--primary-light:#d1fae5;--bg:#0f172a;--bg-card:#1e293b;--text:#f1f5f9;--text-dim:#94a3b8;--border:#334155}
    *{box-sizing:border-box}html{scroll-behavior:smooth}
    body{margin:0;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;background:var(--bg);color:var(--text);line-height:1.7}
    .lp-nav{position:sticky;top:0;z-index:1000;background:rgba(15,23,42,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)}
    .lp-nav-inner{max-width:1200px;margin:auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
    .lp-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text);font-weight:800;font-size:1.3rem}
    .lp-brand-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#10b981,#059669);display:grid;place-items:center;font-size:1.1rem;box-shadow:0 4px 12px rgba(16,185,129,.3)}
    .lp-nav-links{display:flex;gap:20px;align-items:center}
    .lp-nav-links a{color:var(--text-dim);text-decoration:none;font-weight:500;font-size:.92rem;transition:color .2s;white-space:nowrap}
    .lp-nav-links a:hover{color:var(--primary)}
    .lp-nav-cta{background:var(--primary)!important;color:#fff!important;padding:8px 18px;border-radius:10px;font-weight:700!important}
    .lp-nav-cta:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(16,185,129,.3)}
    .lang-sel{padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);font-family:inherit;font-weight:600;font-size:.82rem;cursor:pointer;outline:none}
    .lang-sel:hover{border-color:var(--primary)}
    .lp-hero{padding:100px 24px 80px;background:radial-gradient(ellipse at 80% 20%,rgba(16,185,129,.12) 0%,transparent 60%);text-align:center}
    .lp-hero-inner{max-width:800px;margin:auto}
    .lp-hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:var(--primary-light);color:var(--primary-dark);border-radius:100px;font-weight:700;font-size:.85rem;margin-bottom:24px}
    .lp-hero h1{font-size:clamp(2.5rem,6vw,4.5rem);line-height:1.1;font-weight:800;letter-spacing:-.03em;margin-bottom:20px}
    .lp-hero h1 em{font-style:normal;background:linear-gradient(135deg,#10b981,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .lp-hero p{font-size:1.2rem;color:var(--text-dim);margin-bottom:36px;max-width:600px;margin-left:auto;margin-right:auto}
    .lp-hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
    .lp-btn{padding:14px 28px;border-radius:14px;font-weight:700;font-size:1rem;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .3s;cursor:pointer;border:none;font-family:inherit}
    .lp-btn-primary{background:var(--primary);color:#fff;box-shadow:0 8px 24px rgba(16,185,129,.3)}
    .lp-btn-primary:hover{background:var(--primary-dark);transform:translateY(-2px)}
    .lp-btn-outline{background:transparent;color:var(--primary);border:2px solid var(--border)}
    .lp-btn-outline:hover{border-color:var(--primary)}
    .lp-section{padding:80px 24px}.lp-section-alt{background:var(--bg-card)}
    .lp-section-inner{max-width:1100px;margin:auto}
    .lp-section-title{text-align:center;margin-bottom:60px}
    .lp-section-title h2{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;margin-bottom:14px}
    .lp-section-title p{color:var(--text-dim);font-size:1.1rem;max-width:600px;margin:auto}
    .lp-grid{display:grid;gap:24px}.lp-grid-3{grid-template-columns:repeat(3,1fr)}.lp-grid-4{grid-template-columns:repeat(4,1fr)}
    .lp-card{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:28px;transition:transform .3s,box-shadow .3s}
    .lp-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.3)}
    .lp-card-icon{width:48px;height:48px;border-radius:12px;background:rgba(16,185,129,.15);display:grid;place-items:center;font-size:1.5rem;margin-bottom:16px}
    .lp-card h3{font-size:1.15rem;margin-bottom:10px;font-weight:700}
    .lp-card p{color:var(--text-dim);font-size:.95rem}
    .lp-pipeline{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;padding:32px;background:var(--bg-card);border:1px solid var(--border);border-radius:20px;margin-bottom:48px}
    .lp-pipeline-step{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 18px;background:rgba(16,185,129,.1);border-radius:12px;min-width:100px;text-align:center}
    .lp-pipeline-step .icon{font-size:1.8rem}.lp-pipeline-step .label{font-size:.8rem;font-weight:600;color:var(--text-dim)}
    .lp-pipeline-arrow{font-size:1.5rem;color:var(--primary)}
    .lp-steps{counter-reset:step}
    .lp-step{display:flex;gap:24px;align-items:flex-start;margin-bottom:40px;padding:28px;background:var(--bg-card);border:1px solid var(--border);border-radius:20px;counter-increment:step}
    .lp-step-num{flex-shrink:0;width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#10b981,#059669);display:grid;place-items:center;font-weight:800;font-size:1.3rem;color:#fff}
    .lp-step-num::after{content:counter(step)}
    .lp-step-body h3{font-size:1.2rem;margin-bottom:8px}
    .lp-step-body p{color:var(--text-dim);font-size:.95rem}
    .lp-step-body code{font-family:'JetBrains Mono',monospace;background:rgba(16,185,129,.12);color:var(--primary);padding:2px 8px;border-radius:6px;font-size:.85rem}
    .lp-tech-table{width:100%;border-collapse:collapse;font-size:.95rem}
    .lp-tech-table th,.lp-tech-table td{padding:14px 18px;text-align:left;border-bottom:1px solid var(--border)}
    .lp-tech-table th{font-weight:700;color:var(--primary);font-size:.85rem;text-transform:uppercase;letter-spacing:.05em}
    .lp-tech-table td{color:var(--text-dim)}.lp-tech-table td:first-child{font-weight:600;color:var(--text)}
    .lp-faq{margin-bottom:20px}
    .lp-faq summary{font-weight:700;font-size:1.05rem;cursor:pointer;padding:18px 24px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;list-style:none;display:flex;align-items:center;gap:12px}
    .lp-faq summary::before{content:'▸';transition:transform .2s}
    .lp-faq[open] summary::before{transform:rotate(90deg)}
    .lp-faq summary::-webkit-details-marker{display:none}
    .lp-faq .answer{padding:18px 24px;color:var(--text-dim);font-size:.95rem;border:1px solid var(--border);border-top:none;border-radius:0 0 14px 14px;background:var(--bg)}
    .lp-footer{padding:32px 24px;text-align:center;color:var(--text-dim);font-size:.85rem;border-top:1px solid var(--border)}
    .lp-footer a{color:var(--primary);text-decoration:none}
    .lp-app-section{padding:60px 24px 60px 0}
    .lp-app-section .lp-section-inner{max-width:calc(100% - 24px);margin:0 auto 0 0;padding:0 24px 0 0}
    .lp-app-section .lp-section-title{margin-bottom:24px;padding-left:24px}
    /* DONATE SECTION */
    .lp-donate{padding:80px 24px;background:radial-gradient(ellipse at center,rgba(16,185,129,.08) 0%,transparent 60%)}
    .lp-donate-inner{max-width:600px;margin:auto;text-align:center}
    .lp-donate h2{font-size:2rem;font-weight:800;margin-bottom:8px}
    .lp-donate>p{color:var(--text-dim);max-width:500px;margin:0 auto 32px}
    .donate-tabs{display:flex;gap:8px;background:var(--bg-card);border-radius:18px;padding:6px;margin-bottom:0;border:1px solid var(--border)}
    .donate-tab{flex:1;padding:14px;border:none;border-radius:14px;font-weight:700;font-size:.95rem;cursor:pointer;background:transparent;color:var(--text-dim);transition:all .3s;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px}
    .donate-tab:hover:not(.active){background:rgba(16,185,129,.08)}
    .donate-tab.active{background:var(--bg);color:var(--text);box-shadow:0 4px 14px rgba(0,0,0,.3)}
    .donate-tab .coin-dot{width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.7rem;color:#fff;font-weight:800}
    .coin-btc{background:#f7931a}.coin-eth{background:#627eea}.coin-usdt{background:#26a17b}
    .donate-pane{display:none;padding:32px 28px;background:var(--bg-card);border:1px solid var(--border);border-top:none;border-radius:0 0 20px 20px;animation:fadeIn .4s ease}
    .donate-pane.active{display:block}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    .donate-content{display:grid;grid-template-columns:180px 1fr;gap:28px;align-items:center}
    .donate-qr{width:180px;height:180px;background:#fff;border-radius:16px;padding:12px;display:grid;place-items:center;box-shadow:0 8px 22px rgba(0,0,0,.15)}
    .donate-qr canvas,.donate-qr img{max-width:100%!important;max-height:100%!important;border-radius:8px}
    .donate-info{display:flex;flex-direction:column;gap:12px;text-align:left}
    .donate-info h3{margin:0;font-size:1.2rem;display:flex;align-items:center;gap:8px}
    .donate-network{font-size:.75rem;font-weight:600;padding:3px 10px;border-radius:100px;background:rgba(16,185,129,.12);color:var(--primary)}
    .donate-addr-row{display:flex;gap:8px;align-items:stretch}
    .donate-addr{flex:1;padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:12px;font-family:'JetBrains Mono',monospace;font-size:.82rem;color:var(--text-dim);word-break:break-all;line-height:1.5}
    .donate-copy{flex-shrink:0;padding:0 16px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:.85rem;cursor:pointer;transition:all .25s;font-family:inherit;display:flex;align-items:center;gap:6px;white-space:nowrap}
    .donate-copy:hover{background:var(--primary-dark);transform:translateY(-1px)}
    .donate-copy.copied{background:#059669}
    .donate-warning{font-size:.82rem;color:#f59e0b;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);padding:10px 14px;border-radius:10px;display:flex;align-items:flex-start;gap:8px;line-height:1.45;text-align:left}
    @media(max-width:900px){.lp-grid-3,.lp-grid-4{grid-template-columns:1fr 1fr}}
    @media(max-width:600px){.lp-grid-3,.lp-grid-4{grid-template-columns:1fr}.lp-nav-links a:not(.lp-nav-cta){display:none}.lp-step{flex-direction:column}.lp-pipeline{flex-direction:column}.lp-pipeline-arrow{transform:rotate(90deg)}.donate-content{grid-template-columns:1fr;justify-items:center}.donate-info{text-align:center;align-items:center}}
  </style>
</head>
<body>
  <nav class="lp-nav">
    <div class="lp-nav-inner">
      <a class="lp-brand" href="#top"><div class="lp-brand-icon">🛡️</div>Cryptoimg</a>
      <div class="lp-nav-links">
        <a href="#how-it-works" data-i18n="nav_how">How It Works</a>
        <a href="#guide" data-i18n="nav_guide">Guide</a>
        <a href="#tech" data-i18n="nav_tech">Technology</a>
        <a href="#faq" data-i18n="nav_faq">FAQ</a>
        <a class="lp-nav-cta" href="#app" data-i18n="nav_launch">Launch App</a>
        <select class="lang-sel" id="langSwitcher" aria-label="Language">
          <option value="en">EN</option><option value="ru">RU</option><option value="de">DE</option><option value="fr">FR</option><option value="es">ES</option><option value="zh">ZH</option>
        </select>
      </div>
    </div>
  </nav>

  <header class="lp-hero" id="top">
    <div class="lp-hero-inner">
      <span class="lp-hero-badge" data-i18n="hero_badge">🔒 100% Client-Side · Zero Server</span>
      <h1 data-i18n-html="hero_title">Hide Any File<br>Inside <em>Any Image</em></h1>
      <p data-i18n="hero_sub">Steganography + AES-256-GCM encryption + Argon2id key derivation + Reed-Solomon error correction. Your data never leaves your browser.</p>
      <div class="lp-hero-actions">
        <a class="lp-btn lp-btn-primary" href="#app" data-i18n="hero_app">🔐 Open App</a>
        <a class="lp-btn lp-btn-outline" href="#guide" data-i18n="hero_guide">📖 Read Guide</a>
      </div>
    </div>
  </header>

  <!-- HOW IT WORKS -->
  <section class="lp-section lp-section-alt" id="how-it-works">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2 data-i18n="how_title">How Crypto-Steganography Works</h2>
        <p data-i18n="how_sub">Multi-layer protection: encryption makes data unreadable, steganography makes it invisible.</p>
      </div>
      <div class="lp-pipeline">
        <div class="lp-pipeline-step"><span class="icon">📄</span><span class="label" data-i18n="pipe_file">Your File</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">📦</span><span class="label" data-i18n="pipe_deflate">Deflate</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">🔑</span><span class="label">AES-256-GCM</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">🛡️</span><span class="label">Reed-Solomon</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">🖼️</span><span class="label" data-i18n="pipe_stego">Stego Embed</span></div>
        <span class="lp-pipeline-arrow">→</span>
        <div class="lp-pipeline-step"><span class="icon">📸</span><span class="label" data-i18n="pipe_output">Output Image</span></div>
      </div>
      <div class="lp-grid lp-grid-4">
        <div class="lp-card"><div class="lp-card-icon">📦</div><h3 data-i18n="c1_t">Deflate Compression</h3><p data-i18n="c1_d">Your file is compressed using DEFLATE before encryption, maximizing the amount of data that fits inside the image.</p></div>
        <div class="lp-card"><div class="lp-card-icon">🔑</div><h3 data-i18n="c2_t">AES-256-GCM</h3><p data-i18n="c2_d">Authenticated encryption. Even if someone knows you used Cryptoimg, they cannot read the data without your PIN. Any tampering is detected via the auth tag.</p></div>
        <div class="lp-card"><div class="lp-card-icon">🧬</div><h3 data-i18n="c3_t">Argon2id KDF</h3><p data-i18n="c3_d">Your PIN is transformed into a cryptographic key using Argon2id — the winner of the Password Hashing Competition. Resistant to GPU and ASIC attacks.</p></div>
        <div class="lp-card"><div class="lp-card-icon">🛡️</div><h3 data-i18n="c4_t">Reed-Solomon ECC</h3><p data-i18n="c4_d">Error-correcting codes protect against minor image modifications (re-saving, format conversion). The data survives JPEG→PNG conversion.</p></div>
      </div>
    </div>
  </section>

  <!-- GUIDE -->
  <section class="lp-section" id="guide">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2 data-i18n="guide_title">Step-by-Step Guide</h2>
        <p data-i18n="guide_sub">Complete walkthrough for hiding and extracting files from images.</p>
      </div>
      <h3 style="font-size:1.4rem;margin-bottom:24px;color:var(--primary)" data-i18n="enc_h">🔐 How to Hide a File (Encode)</h3>
      <div class="lp-steps">
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="e1_t">Choose a Carrier Image</h3><p data-i18n="e1_d">Click <strong>"Select Image"</strong> and pick a PNG, WebP, or AVIF file. The app will auto-convert JPEGs to lossless format. Larger images = more storage capacity.</p></div></div>
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="e2_t">Enter Your Secret Data</h3><p data-i18n="e2_d">Switch between <strong>Text</strong> and <strong>File</strong> tabs. For files, drag-and-drop or click to browse. The capacity indicator shows exactly how much data fits.</p></div></div>
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="e3_t">Set a PIN Code</h3><p data-i18n="e3_d">Enter and confirm your PIN. This is the <strong>only</strong> thing you need to remember. The PIN is never stored — it is used to derive the encryption key via Argon2id + HKDF.</p></div></div>
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="e4_t">Choose Output Format</h3><p data-i18n="e4_d">Select <strong>PNG</strong> (lossless, best), <strong>WebP</strong> (smaller, still lossless), or <strong>AVIF</strong> (newest, smallest). All formats preserve the hidden data.</p></div></div>
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="e5_t">Encrypt & Download</h3><p data-i18n="e5_d">Click <strong>"Encrypt & Embed"</strong>. The app will: compress → encrypt → add error correction → embed in pixels → self-test verify → download the output image.</p></div></div>
      </div>
      <h3 style="font-size:1.4rem;margin-bottom:24px;margin-top:48px;color:var(--primary)" data-i18n="dec_h">🔓 How to Extract a File (Decode)</h3>
      <div class="lp-steps">
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="d1_t">Upload the Stego Image</h3><p data-i18n="d1_d">Click <strong>"Select Image"</strong> and pick the image that contains hidden data.</p></div></div>
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="d2_t">Enter the PIN</h3><p data-i18n="d2_d">Type the same PIN you used when encoding. The app will run Argon2id to derive the decryption key.</p></div></div>
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="d3_t">Extract & Download</h3><p data-i18n="d3_d">Click <strong>"Extract"</strong>. The app reads the hidden data, verifies Reed-Solomon error correction, decrypts, decompresses, and shows the result.</p></div></div>
      </div>
      <h3 style="font-size:1.4rem;margin-bottom:24px;margin-top:48px;color:var(--primary)" data-i18n="album_h">📦 Album Mode (Large Files)</h3>
      <div class="lp-steps">
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="a1_t">Select Multiple Carrier Images</h3><p data-i18n="a1_d">Switch to <strong>"Album Encode"</strong> tab. Select 2+ images. The app auto-calculates how many are needed.</p></div></div>
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="a2_t">File is Split Automatically</h3><p data-i18n="a2_d">Your file is split into chunks, each encrypted independently with its own salt/nonce. Empty images are skipped.</p></div></div>
        <div class="lp-step"><div class="lp-step-num"></div><div class="lp-step-body"><h3 data-i18n="a3_t">Extract from Album</h3><p data-i18n="a3_d">Switch to <strong>"Album Extract"</strong> tab, enter your PIN, select all album images at once. All chunks decoded in parallel and reassembled.</p></div></div>
      </div>
    </div>
  </section>

  <!-- TECH -->
  <section class="lp-section lp-section-alt" id="tech">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2 data-i18n="tech_title">Technical Details</h2>
        <p data-i18n="tech_sub">The full cryptographic pipeline powering Cryptoimg.</p>
      </div>
      <div class="lp-card" style="overflow-x:auto">
        <table class="lp-tech-table">
          <thead><tr><th data-i18n="th_comp">Component</th><th data-i18n="th_algo">Algorithm</th><th data-i18n="th_purpose">Purpose</th></tr></thead>
          <tbody>
            <tr><td data-i18n="t1_c">Key Derivation</td><td>Argon2id (65 MB, 3 iter, p=4)</td><td data-i18n="t1_p">PIN → 256-bit stego key + 256-bit enc key. GPU/ASIC resistant.</td></tr>
            <tr><td data-i18n="t2_c">Key Expansion</td><td>HKDF-SHA256</td><td data-i18n="t2_p">Derives separate stego key and encryption key from Argon2 output.</td></tr>
            <tr><td data-i18n="t3_c">Encryption</td><td>AES-256-GCM</td><td data-i18n="t3_p">Authenticated encryption. 12-byte nonce, 16-byte auth tag, AAD = envelope header.</td></tr>
            <tr><td data-i18n="t4_c">Compression</td><td>DEFLATE (raw)</td><td data-i18n="t4_p">Reduces payload size before encryption. ~50-70% ratio on text.</td></tr>
            <tr><td data-i18n="t5_c">Error Correction</td><td>Reed-Solomon (GF(2^8))</td><td data-i18n="t5_p">Protects against minor image modifications. 25% overhead.</td></tr>
            <tr><td data-i18n="t6_c">Steganography</td><td>LSB in variance-filtered pixels</td><td data-i18n="t6_p">Data hidden in least-significant bits. Designed to minimize statistical artifacts via adaptive pixel selection.</td></tr>
            <tr><td data-i18n="t7_c">Self-Test</td><td>Extract → decrypt → verify MAGIC</td><td data-i18n="t7_p">After encoding, immediately verifies data can be extracted correctly.</td></tr>
            <tr><td data-i18n="t8_c">Album Mode</td><td>CHUNK record + SHA-256</td><td data-i18n="t8_p">Splits large files across multiple images. Each chunk independently encrypted.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="lp-section" id="faq">
    <div class="lp-section-inner">
      <div class="lp-section-title"><h2 data-i18n="faq_title">Frequently Asked Questions</h2></div>
      <details class="lp-faq"><summary data-i18n="faq1_q">Is the data really hidden?</summary><div class="answer" data-i18n="faq1_a">Cryptoimg uses LSB steganography in variance-filtered pixels. The changes are designed to minimize statistical artifacts — the modified pixels look identical to the original.</div></details>
      <details class="lp-faq"><summary data-i18n="faq2_q">What happens if I lose the PIN?</summary><div class="answer" data-i18n="faq2_a">The data is gone. The PIN is the only way to derive the decryption key. There is no backdoor or recovery mechanism. This is by design.</div></details>
      <details class="lp-faq"><summary data-i18n="faq3_q">Can I share the output on social media?</summary><div class="answer" data-i18n="faq3_a">Social media re-compresses images, which can destroy hidden data. Use lossless sharing: email, cloud storage, or direct file transfer.</div></details>
      <details class="lp-faq"><summary data-i18n="faq4_q">How is this different from encryption?</summary><div class="answer" data-i18n="faq4_a">Encryption makes data unreadable. Steganography makes data invisible. Cryptoimg does both — the image looks normal, there is nothing to intercept.</div></details>
      <details class="lp-faq"><summary data-i18n="faq5_q">What image formats work?</summary><div class="answer" data-i18n="faq5_a">Input: any image (JPEG, PNG, WebP, AVIF, BMP, TIFF). Auto-converts to lossless. Output: PNG, WebP, or AVIF — all lossless.</div></details>
      <details class="lp-faq"><summary data-i18n="faq6_q">Is anything sent to a server?</summary><div class="answer" data-i18n="faq6_a">No. Everything happens in your browser using Web Crypto API, WebAssembly, and Canvas API. Zero network requests during encode/decode.</div></details>
    </div>
  </section>

  <!-- APP -->
  <section class="lp-app-section" id="app">
    <div class="lp-section-inner">
      <div class="lp-section-title">
        <h2 data-i18n="app_title">Launch Cryptoimg</h2>
        <p data-i18n="app_sub">The full-featured steganography app runs right here in your browser.</p>
      </div>
      <div class="lp-app-container"><div id="root"></div></div>
    </div>
  </section>

  <!-- DONATE -->
  <section class="lp-donate" id="donate">
    <div class="lp-donate-inner">
      <h2 data-i18n="don_title">❤️ Support Cryptoimg</h2>
      <p data-i18n="don_sub">If this tool is useful to you, consider supporting development.</p>
      <div class="donate-tabs" id="donateTabs">
        <button class="donate-tab active" data-coin="btc" onclick="switchDonate('btc')"><span class="coin-dot coin-btc">₿</span> Bitcoin</button>
        <button class="donate-tab" data-coin="eth" onclick="switchDonate('eth')"><span class="coin-dot coin-eth">Ξ</span> Ethereum</button>
        <button class="donate-tab" data-coin="usdt" onclick="switchDonate('usdt')"><span class="coin-dot coin-usdt">₮</span> USDT</button>
      </div>
      <div class="donate-pane active" id="pane-btc">
        <div class="donate-content">
          <div class="donate-qr" id="qr-btc"></div>
          <div class="donate-info">
            <h3>🟠 Bitcoin <span class="donate-network">BTC</span></h3>
            <div class="donate-addr-row">
              <div class="donate-addr" id="addr-btc">bc1q48l0mfvrs6kza5xs6qmzagatmpelrxzyqcwfhpz</div>
              <button class="donate-copy" onclick="copyAddr('btc',this)" data-i18n="copy">📋 Copy</button>
            </div>
          </div>
        </div>
      </div>
      <div class="donate-pane" id="pane-eth">
        <div class="donate-content">
          <div class="donate-qr" id="qr-eth"></div>
          <div class="donate-info">
            <h3>🔷 Ethereum <span class="donate-network">ETH / ERC-20</span></h3>
            <div class="donate-addr-row">
              <div class="donate-addr" id="addr-eth">0x6889fD4d5B688d6E3c4b7E5A2B1D6E8F2C3A4b5D</div>
              <button class="donate-copy" onclick="copyAddr('eth',this)" data-i18n="copy">📋 Copy</button>
            </div>
          </div>
        </div>
      </div>
      <div class="donate-pane" id="pane-usdt">
        <div class="donate-content">
          <div class="donate-qr" id="qr-usdt"></div>
          <div class="donate-info">
            <h3>🟢 USDT <span class="donate-network">TRC-20</span></h3>
            <div class="donate-addr-row">
              <div class="donate-addr" id="addr-usdt">TN7V3t8EKjRTJFXNJwMjYpLqHGSQN7BTyv</div>
              <button class="donate-copy" onclick="copyAddr('usdt',this)" data-i18n="copy">📋 Copy</button>
            </div>
          </div>
        </div>
      </div>
      <div class="donate-warning">⚠️ <span data-i18n="don_warn">Always verify the address after copying. Send only BTC to the Bitcoin address, ETH to the Ethereum address, and USDT (TRC-20) to the TRON address.</span></div>
    </div>
  </section>

  <footer class="lp-footer">
    <p>Cryptoimg v5.2 · AES-256-GCM + Argon2id + Reed-Solomon</p>
    <p style="margin-top:8px" data-i18n="footer_note">All processing happens locally. No data leaves your device.</p>
  </footer>

  <script src="./qrcode.min.js"></script>
  <script>
  // ====== DONATE ======
  const ADDRS={btc:'bc1q48l0mfvrs6kza5xs6qmzagatmpelrxzyqcwfhpz',eth:'0x6889fD4d5B688d6E3c4b7E5A2B1D6E8F2C3A4b5D',usdt:'TN7V3t8EKjRTJFXNJwMjYpLqHGSQN7BTyv'};
  function genQR(id,text){const el=document.getElementById(id);el.innerHTML='';if(window.QRCode){new QRCode(el,{text:text,width:156,height:156,colorDark:'#1e293b',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});}}
  function switchDonate(coin){document.querySelectorAll('.donate-tab').forEach(t=>t.classList.toggle('active',t.dataset.coin===coin));document.querySelectorAll('.donate-pane').forEach(p=>p.classList.toggle('active',p.id==='pane-'+coin));}
  function copyAddr(coin,btn){navigator.clipboard.writeText(ADDRS[coin]).then(()=>{btn.textContent='✅ Copied';btn.classList.add('copied');setTimeout(()=>{btn.textContent='📋 Copy';btn.classList.remove('copied');},2000);}).catch(()=>{});}
  window.addEventListener('DOMContentLoaded',()=>{genQR('qr-btc',ADDRS.btc);genQR('qr-eth',ADDRS.eth);genQR('qr-usdt',ADDRS.usdt);});

  // ====== i18n ======
  const T={
    en:{
      nav_how:'How It Works',nav_guide:'Guide',nav_tech:'Technology',nav_faq:'FAQ',nav_launch:'Launch App',
      hero_badge:'🔒 100% Client-Side · Zero Server',
      hero_title:'Hide Any File<br><em>Inside Any Image</em>',
      hero_sub:'Steganography + AES-256-GCM encryption + Argon2id key derivation + Reed-Solomon error correction. Your data never leaves your browser.',
      hero_app:'🔐 Open App',hero_guide:'📖 Read Guide',
      how_title:'How Crypto-Steganography Works',how_sub:'Multi-layer protection: encryption makes data unreadable, steganography makes it invisible.',
      pipe_file:'Your File',pipe_deflate:'Deflate',pipe_stego:'Stego Embed',pipe_output:'Output Image',
      c1_t:'Deflate Compression',c1_d:'Your file is compressed using DEFLATE before encryption, maximizing the amount of data that fits inside the image.',
      c2_t:'AES-256-GCM',c2_d:'Authenticated encryption. Even if someone knows you used Cryptoimg, they cannot read the data without your PIN. Any tampering is detected via the auth tag.',
      c3_t:'Argon2id KDF',c3_d:'Your PIN is transformed into a cryptographic key using Argon2id — the winner of the Password Hashing Competition. Resistant to GPU and ASIC attacks.',
      c4_t:'Reed-Solomon ECC',c4_d:'Error-correcting codes protect against minor image modifications (re-saving, format conversion). The data survives JPEG→PNG conversion.',
      guide_title:'Step-by-Step Guide',guide_sub:'Complete walkthrough for hiding and extracting files from images.',
      enc_h:'🔐 How to Hide a File (Encode)',
      e1_t:'Choose a Carrier Image',e1_d:'Click <strong>"Select Image"</strong> and pick a PNG, WebP, or AVIF file. The app will auto-convert JPEGs to lossless format. Larger images = more storage capacity.',
      e2_t:'Enter Your Secret Data',e2_d:'Switch between <strong>Text</strong> and <strong>File</strong> tabs. For files, drag-and-drop or click to browse. The capacity indicator shows exactly how much data fits.',
      e3_t:'Set a PIN Code',e3_d:'Enter and confirm your PIN. This is the <strong>only</strong> thing you need to remember. The PIN is never stored — is used to derive the encryption key via Argon2id + HKDF.',
      e4_t:'Choose Output Format',e4_d:'Select <strong>PNG</strong> (lossless, best), <strong>WebP</strong> (smaller, still lossless), or <strong>AVIF</strong> (newest, smallest). All formats preserve the hidden data.',
      e5_t:'Encrypt & Download',e5_d:'Click <strong>"Encrypt & Embed"</strong>. The app will: compress → encrypt → add error correction → embed in pixels → self-test verify → download the output image.',
      dec_h:'🔓 How to Extract a File (Decode)',
      d1_t:'Upload the Stego Image',d1_d:'Click <strong>"Select Image"</strong> and pick the image that contains hidden data.',
      d2_t:'Enter the PIN',d2_d:'Type the same PIN you used when encoding. The app will run Argon2id to derive the decryption key.',
      d3_t:'Extract & Download',d3_d:'Click <strong>"Extract"</strong>. The app reads the hidden data, verifies Reed-Solomon error correction, decrypts, decompresses, and shows the result.',
      album_h:'📦 Album Mode (Large Files)',
      a1_t:'Select Multiple Carrier Images',a1_d:'Switch to <strong>"Album Encode"</strong> tab. Select 2+ images. The app auto-calculates how many are needed.',
      a2_t:'File is Split Automatically',a2_d:'Your file is split into chunks, each encrypted independently with its own salt/nonce. Empty images are skipped.',
      a3_t:'Extract from Album',a3_d:'Switch to <strong>"Album Extract"</strong> tab, enter your PIN, select all album images at once. All chunks decoded in parallel and reassembled.',
      tech_title:'Technical Details',tech_sub:'The full cryptographic pipeline powering Cryptoimg.',
      th_comp:'Component',th_algo:'Algorithm',th_purpose:'Purpose',
      t1_c:'Key Derivation',t1_p:'PIN → 256-bit stego key + 256-bit enc key. GPU/ASIC resistant.',
      t2_c:'Key Expansion',t2_p:'Derives separate stego key and encryption key from Argon2 output.',
      t3_c:'Encryption',t3_p:'Authenticated encryption. 12-byte nonce, 16-byte auth tag, AAD = envelope header.',
      t4_c:'Compression',t4_p:'Reduces payload size before encryption. ~50-70% ratio on text.',
      t5_c:'Error Correction',t5_p:'Protects against minor image modifications. 25% overhead.',
      t6_c:'Steganography',t6_p:'Data hidden in least-significant bits. Designed to minimize statistical artifacts via adaptive pixel selection.',
      t7_c:'Self-Test',t7_p:'After encoding, immediately verifies data can be extracted correctly.',
      t8_c:'Album Mode',t8_p:'Splits large files across multiple images. Each chunk independently encrypted.',
      faq_title:'Frequently Asked Questions',
      faq1_q:'Is the data really hidden?',faq1_a:'Cryptoimg uses LSB steganography in variance-filtered pixels. The changes are designed to minimize statistical artifacts — the modified pixels look identical to the original.',
      faq2_q:'What happens if I lose the PIN?',faq2_a:'The data is gone. The PIN is the only way to derive the decryption key. There is no backdoor or recovery mechanism. This is by design.',
      faq3_q:'Can I share the output on social media?',faq3_a:'Social media re-compresses images, which can destroy hidden data. Use lossless sharing: email, cloud storage, or direct file transfer.',
      faq4_q:'How is this different from encryption?',faq4_a:'Encryption makes data unreadable. Steganography makes data invisible. Cryptoimg does both — the image looks normal, there is nothing to intercept.',
      faq5_q:'What image formats work?',faq5_a:'Input: any image (JPEG, PNG, WebP, AVIF, BMP, TIFF). Auto-converts to lossless. Output: PNG, WebP, or AVIF — all lossless.',
      faq6_q:'Is anything sent to a server?',faq6_a:'No. Everything happens in your browser using Web Crypto API, WebAssembly, and Canvas API. Zero network requests during encode/decode.',
      don_title:'❤️ Support Cryptoimg',don_sub:'If this tool is useful to you, consider supporting development.',
      don_warn:'Always verify the address after copying. Send only BTC to the Bitcoin address, ETH to the Ethereum address, and USDT (TRC-20) to the TRON address.',
      copy:'📋 Copy',app_title:'Launch Cryptoimg',app_sub:'The full-featured steganography app runs right here in your browser.',
      footer_note:'All processing happens locally. No data leaves your device.'
    },
    ru:{
      nav_how:'Как работает',nav_guide:'Руководство',nav_tech:'Технологии',nav_faq:'FAQ',nav_launch:'Запустить',
      hero_badge:'🔒 100% локально · Нулевой сервер',
      hero_title:'Спрячьте файл<br><em>в любом фото</em>',
      hero_sub:'Стеганография + AES-256-GCM + Argon2id + код Рида-Соломона. Данные не покидают ваш браузер.',
      hero_app:'🔐 Открыть приложение',hero_guide:'📖 Руководство',
      how_title:'Как работает крипто-стеганография',how_sub:'Многоуровневая защита: шифрование делает данные нечитаемыми, стеганография — невидимыми.',
      pipe_file:'Ваш файл',pipe_deflate:'Deflate',pipe_stego:'Встраивание',pipe_output:'Изображение',
      c1_t:'Сжатие Deflate',c1_d:'Файл сжимается DEFLATE перед шифрованием, увеличивая объём данных, вмещающихся в изображение.',
      c2_t:'AES-256-GCM',c2_d:'Аутентифицированное шифрование. Даже если кто-то знает о Cryptoimg, без ПИН-кода данные не прочитать. Любая подделка обнаруживается через auth tag.',
      c3_t:'Argon2id KDF',c3_d:'ПИН-код преобразуется в криптографический ключ через Argon2id — победитель Password Hashing Competition. Устойчив к GPU/ASIC атакам.',
      c4_t:'Код Рида-Соломона',c4_d:'Коды коррекции ошибок защищают от незначительных модификаций изображения (пересохранение, конвертация формата).',
      guide_title:'Пошаговое руководство',guide_sub:'Полное описание скрытия и извлечения файлов из изображений.',
      enc_h:'🔐 Как скрыть файл (Кодирование)',
      e1_t:'Выберите изображение-контейнер',e1_d:'Нажмите <strong>"Выбрать изображение"</strong> и выберите PNG, WebP или AVIF. JPEG автоматически конвертируется в без потерь.',
      e2_t:'Введите секретные данные',e2_d:'Переключайтесь между вкладками <strong>Текст</strong> и <strong>Файл</strong>. Для файлов — перетащите или нажмите для выбора.',
      e3_t:'Установите ПИН-код',e3_d:'Введите и подтвердите ПИН. Это <strong>единственное</strong>, что нужно запомнить. ПИН не хранится — он используется для вывода ключа через Argon2id + HKDF.',
      e4_t:'Выберите формат',e4_d:'Выберите <strong>PNG</strong> (без потерь, лучший), <strong>WebP</strong> (меньше) или <strong>AVIF</strong> (новейший,ультракомпактный).',
      e5_t:'Зашифровать и скачать',e5_d:'Нажмите <strong>"Зашифровать"</strong>. Приложение: сожмёт → зашифрует → добавит коррекцию ошибок → встроит в пиксели → проверит → скачает.',
      dec_h:'🔓 Как извлечь файл (Декодирование)',
      d1_t:'Загрузите стего-изображение',d1_d:'Нажмите <strong>"Выбрать изображение"</strong> и выберите фото со скрытыми данными.',
      d2_t:'Введите ПИН-код',d2_d:'Введите тот же ПИН, что использовался при кодировании. Приложение выведет ключ через Argon2id.',
      d3_t:'Извлечь и скачать',d3_d:'Нажмите <strong>"Извлечь"</strong>. Приложение считает данные, проверит коррекцию ошибок, расшифрует и покажет результат.',
      album_h:'📦 Режим альбома (большие файлы)',
      a1_t:'Выберите несколько изображений',a1_d:'Переключитесь на вкладку <strong>"Альбом"</strong>. Выберите 2+ изображения. Приложение автоматически рассчитает сколько нужно.',
      a2_t:'Файл разделяется автоматически',a2_d:'Файл разбивается на части, каждая шифруется отдельно со своим salt/nonce. Пустые изображения пропускаются.',
      a3_t:'Извлечение из альбома',a3_d:'Переключитесь на <strong>"Извлечение из альбома"</strong>, введите ПИН, выберите все изображения сразу. Все части декодируются параллельно.',
      tech_title:'Технические детали',tech_sub:'Полный криптографический конвейер Cryptoimg.',
      th_comp:'Компонент',th_algo:'Алгоритм',th_purpose:'Назначение',
      t1_c:'Вывод ключа',t1_p:'ПИН → 256-бит stego key + 256-бит enc key. Устойчив к GPU/ASIC.',
      t2_c:'Расширение ключа',t2_p:'Выводит отдельные ключи для стеганографии и шифрования из результата Argon2.',
      t3_c:'Шифрование',t3_p:'Аутентифицированное шифрование. 12-байтовый nonce, 16-байтовый auth tag.',
      t4_c:'Сжатие',t4_p:'Уменьшает размер данных перед шифрованием. ~50-70% для текста.',
      t5_c:'Коррекция ошибок',t5_p:'Защита от модификаций изображения. 25% накладные расходы.',
      t6_c:'Стеганография',t6_p:'Данные скрыты в младших битах. Минимизация статистических артефактов адаптивным выбором пикселей.',
      t7_c:'Self-Test',t7_p:'После кодирования немедленно проверяет корректность извлечения.',
      t8_c:'Режим альбома',t8_p:'Разделяет файлы на несколько изображений. Каждая часть шифруется отдельно.',
      faq_title:'Часто задаваемые вопросы',
      faq1_q:'Правда ли данные скрыты?',faq1_a:'Cryptoimg использует LSB-стеганографию в фильтрованных по вариативности пикселях. Изменения максимально минимизируют статистические артефакты.',
      faq2_q:'Что будет, если забыть ПИН?',faq2_a:'Данные потеряны. ПИН — единственный способ получить ключ. Нет бэкдоров или восстановления. Это сделано намеренно.',
      faq3_q:'Можно ли поделиться фото в соцсетях?',faq3_a:'Соцсети пережимают изображения, уничтожая скрытые данные. Используйте email, облачные хранилища или прямую передачу файлов.',
      faq4_q:'Чем это отличается от простого шифрования?',faq4_a:'Шифрование делает данные нечитаемыми. Стеганография делает данные невидимыми. Cryptoimg делает и то, и другое.',
      faq5_q:'Какие форматы изображений поддерживаются?',faq5_a:'Вход: любой (JPEG, PNG, WebP, AVIF, BMP, TIFF). Авто-конвертация. Выход: PNG, WebP или AVIF — все без потерь.',
      faq6_q:'Что-то отправляется на сервер?',faq6_a:'Ничего. Всё работает в браузере через Web Crypto API, WebAssembly и Canvas API. Нулевые сетевые запросы.',
      don_title:'❤️ Поддержать Cryptoimg',don_sub:'Если инструмент полезен, поддержите развитие проекта.',
      don_warn:'Всегда проверяйте адрес после копирования. Отправляйте только BTC на биткойн-адрес, ETH на адрес Ethereum и USDT (TRC-20) на адрес TRON.',
      copy:'📋 Копировать',app_title:'Запустить Cryptoimg',app_sub:'Полнофункциональное приложение стеганографии работает прямо здесь, в вашем браузере.',
      footer_note:'Все вычисления происходят локально. Данные не покидают ваше устройство.'
    },
    de:{
      nav_how:'Wie es funktioniert',nav_guide:'Anleitung',nav_tech:'Technologie',nav_faq:'FAQ',nav_launch:'App starten',
      hero_badge:'🔒 100% Client-Seitig · Kein Server',
      hero_title:'Verstecke jede Datei<br><em>in jedem Bild</em>',
      hero_sub:'Steganographie + AES-256-GCM + Argon2id + Reed-Solomon-Fehlerkorrektur. Deine Daten verlassen nie deinen Browser.',
      hero_app:'🔐 App öffnen',hero_guide:'📖 Anleitung lesen',
      how_title:'Krypto-Steganographie erklärt',how_sub:'Mehrschichtiger Schutz: Verschlüsselung macht Daten unlesbar, Steganographie macht sie unsichtbar.',
      pipe_file:'Deine Datei',pipe_deflate:'Deflate',pipe_stego:'Stego-Einbettung',pipe_output:'Ausgabebild',
      c1_t:'Deflate-Komprimierung',c1_d:'Deine Datei wird mit DEFLATE komprimiert, bevor sie verschlüsselt wird — mehr Daten passen ins Bild.',
      c2_t:'AES-256-GCM',c2_d:'Authentifizierte Verschlüsselung. Ohne PIN sind die Daten unzugänglich. Jede Manipulation wird via Auth-Tag erkannt.',
      c3_t:'Argon2id KDF',c3_d:'Der PIN wird mit Argon2id in einen kryptografischen Schlüssel umgewandelt — resistent gegen GPU- und ASIC-Angriffe.',
      c4_t:'Reed-Solomon ECC',c4_d:'Fehlerkorrekturcodes schützen vor kleinen Bildmodifikationen (Neuspeicherung, Formatkonvertierung).',
      guide_title:'Schritt-für-Schritt-Anleitung',guide_sub:'Vollständige Anleitung zum Verstecken und Extrahieren von Dateien.',
      enc_h:'🔐 Datei verstecken (Kodierung)',
      e1_t:'Trägerbild wählen',e1_d:'Klicke <strong>"Bild auswählen"</strong> und wähle PNG, WebP oder AVIF. JPEG wird automatisch in verlustfrei konvertiert.',
      e2_t:'Geheimdaten eingeben',e2_d:'Wechsle zwischen <strong>Text</strong> und <strong>Datei</strong>. Für Dateien: Drag & Drop oder Klick zum Durchsuchen.',
      e3_t:'PIN-Code festlegen',e3_d:'Gib deinen PIN ein und bestätige ihn. Der PIN wird nie gespeichert — er dient zur Schlüsselableitung via Argon2id + HKDF.',
      e4_t:'Ausgabeformat wählen',e4_d:'Wähle <strong>PNG</strong> (verlustfrei), <strong>WebP</strong> (kleiner) oder <strong>AVIF</strong> (neuestes).',
      e5_t:'Verschlüsseln & Herunterladen',e5_d:'Klicke <strong>"Verschlüsseln"</strong>. Das Programm: komprimiert → verschlüsselt → Fehlerkorrektur → bettet ein → prüft → lädt herunter.',
      dec_h:'🔓 Datei extrahieren (Dekodierung)',
      d1_t:'Stego-Bild hochladen',d1_d:'Klicke <strong>"Bild auswählen"</strong> und wähle das Bild mit versteckten Daten.',
      d2_t:'PIN eingeben',d2_d:'Gib denselben PIN wie bei der Kodierung ein. Argon2id leitet den Entschlüsselungs-Key ab.',
      d3_t:'Extrahieren & Herunterladen',d3_d:'Klicke <strong>"Extrahieren"</strong>. Das Programm liest die Daten, prüft Reed-Solomon, entschlüsselt und zeigt das Ergebnis.',
      album_h:'📦 Album-Modus (große Dateien)',
      a1_t:'Mehrere Trägerbilder wählen',a1_d:'Wechsle zum <strong>"Album"</strong>-Tab. Wähle 2+ Bilder. Die App berechnet automatisch, wie viele benötigt werden.',
      a2_t:'Datei wird automatisch aufgeteilt',a2_d:'Die Datei wird in Blöcke aufgeteilt, jeder unabhängig mit eigenem Salt/Nonce verschlüsselt.',
      a3_t:'Aus Album extrahieren',a3_d:'Wechsle zum <strong>"Album extrahieren"</strong>-Tab, gib den PIN ein, wähle alle Bilder auf einmal.',
      tech_title:'Technische Details',tech_sub:'Die volle kryptografische Pipeline von Cryptoimg.',
      th_comp:'Komponente',th_algo:'Algorithmus',th_purpose:'Zweck',
      t1_c:'Schlüsselableitung',t1_p:'PIN → 256-Bit stego key + 256-Bit enc key. GPU/ASIC-resistent.',
      t2_c:'Schlüsselerweiterung',t2_p:'Leitet separate Schlüssel für Stego und Verschlüsselung aus Argon2-Ausgabe ab.',
      t3_c:'Verschlüsselung',t3_p:'Authentifizierte Verschlüsselung. 12-Byte Nonce, 16-Byte Auth Tag.',
      t4_c:'Komprimierung',t4_p:'Reduziert die Payload-Größe vor der Verschlüsselung. ~50-70% bei Text.',
      t5_c:'Fehlerkorrektur',t5_p:'Schutz vor Bildmodifikationen. 25% Overhead.',
      t6_c:'Steganographie',t6_p:'Daten in niederwertigen Bits versteckt. Statistisch unerkennbar.',
      t7_c:'Self-Test',t7_p:'Üprüft nach Kodierung sofort die Korrektheit der Extraktion.',
      t8_c:'Album-Modus',t8_p:'Teilt große Dateien auf mehrere Bilder auf. Jeder Block unabhängig verschlüsselt.',
      faq_title:'Häufig gestellte Fragen',
      faq1_q:'Sind die Daten wirklich versteckt?',faq1_a:'Cryptoimg nutzt LSB-Steganographie in varianzgefilterten Pixeln. Die Änderungen sind statistisch unerkennbar.',
      faq2_q:'Was passiert, wenn ich den PIN vergesse?',faq2_a:'Die Daten sind weg. Der PIN ist der einzige Weg zum Entschlüsselungsschlüssel. Kein Backdoor, keine Wiederherstellung.',
      faq3_q:'Kann ich das Bild in sozialen Medien teilen?',faq3_a:'Soziale Medien komprimieren Bilder neu, was versteckte Daten zerstören kann. Nutze verlustfreie Übertragung.',
      faq4_q:'Wie unterscheidet sich das von normaler Verschlüsselung?',faq4_a:'Verschlüsselung macht Daten unlesbar. Steganographie macht Daten unsichtbar. Cryptoimg macht beides.',
      faq5_q:'Welche Bildformate funktionieren?',faq5_a:'Eingabe: beliebig (JPEG, PNG, WebP, AVIF, BMP, TIFF). Auto-Konvertierung. Ausgabe: PNG, WebP oder AVIF — alles verlustfrei.',
      faq6_q:'Wird etwas an einen Server gesendet?',faq6_a:'Nein. Alles passiert im Browser via Web Crypto API, WebAssembly und Canvas API. Keine Netzwerk-Anfragen.',
      don_title:'❤️ Cryptoimg unterstützen',don_sub:'Wenn das Tool nützlich ist, unterstütze die Entwicklung.',
      don_warn:'Überprüfe immer die Adresse nach dem Kopieren. Sende nur BTC an die Bitcoin-Adresse, ETH an die Ethereum-Adresse und USDT (TRC-20) an die TRON-Adresse.',
      copy:'📋 Kopieren',app_title:'Cryptoimg starten',app_sub:'Die voll funktionsfähige Steganographie-App läuft direkt hier in deinem Browser.',
      footer_note:'Alle Verarbeitung erfolgt lokal. Keine Daten verlassen dein Gerät.'
    },
    fr:{
      nav_how:'Comment ça marche',nav_guide:'Guide',nav_tech:'Technologie',nav_faq:'FAQ',nav_launch:'Lancer',
      hero_badge:'🔒 100% côté client · Zéro serveur',
      hero_title:'Cachez n\'importe quel fichier<br><em>dans n\'importe quelle image</em>',
      hero_sub:'Stéganographie + AES-256-GCM + Argon2id + Reed-Solomon. Vos données ne quittent jamais votre navigateur.',
      hero_app:'🔐 Ouvrir l\'app',hero_guide:'📖 Lire le guide',
      how_title:'Stéganographie cryptographique expliquée',how_sub:'Protection multi-couche : le chiffrement rend les données illisibles, la stéganographie les rend invisibles.',
      pipe_file:'Votre fichier',pipe_deflate:'Deflate',pipe_stego:'Insertion stégo',pipe_output:'Image de sortie',
      c1_t:'Compression Deflate',c1_d:'Votre fichier est compressé avec DEFLATE avant le chiffrement, maximisant la quantité de données dans l\'image.',
      c2_t:'AES-256-GCM',c2_d:'Chiffrement authentifié. Sans le PIN, les données sont inaccessibles. Toute altération est détectée via le tag d’authentification.',
      c3_t:'Argon2id KDF',c3_d:'Le PIN est transformé en clé cryptographique via Argon2id — résistant aux attaques GPU et ASIC.',
      c4_t:'Reed-Solomon ECC',c4_d:'Les codes correcteurs d’erreurs protègent contre les modifications mineures de l\'image (re-sauvegarde, conversion).',
      guide_title:'Guide pas à pas',guide_sub:'Instructions complètes pour cacher et extraire des fichiers.',
      enc_h:'🔐 Comment cacher un fichier (Encodage)',
      e1_t:'Choisir l\'image conteneur',e1_d:'Cliquez <strong>"Sélectionner"</strong> et choisissez PNG, WebP ou AVIF. Les JPEG sont automatiquement convertis en sans perte.',
      e2_t:'Entrez vos données secrètes',e2_d:'Basculez entre <strong>Texte</strong> et <strong>Fichier</strong>. Glissez-déposez ou cliquez pour parcourir.',
      e3_t:'Définir le code PIN',e3_d:'Entrez et confirmez votre PIN. C\'est la <strong>seule</strong> chose à retenir. Le PIN n’est jamais stocké.',
      e4_t:'Choisir le format',e4_d:'<strong>PNG</strong> (sans perte, meilleur), <strong>WebP</strong> (plus petit) ou <strong>AVIF</strong> (le plus récent).',
      e5_t:'Chiffrer & Télécharger',e5_d:'Cliquez <strong>"Chiffrer"</strong>. L’appli : compresse → chiffre → ajoute correction d’erreurs → insère → vérifie → télécharge.',
      dec_h:'🔓 Comment extraire un fichier (Décodage)',
      d1_t:'Télécharger l\'image stégo',d1_d:'Cliquez <strong>"Sélectionner"</strong> et choisissez l\'image contenant les données cachées.',
      d2_t:'Entrez le PIN',d2_d:'Saisissez le même PIN que lors de l’encodage. Argon2id dérive la clé de déchiffrement.',
      d3_t:'Extraire & Télécharger',d3_d:'Cliquez <strong>"Extraire"</strong>. L’appli lit, vérifie Reed-Solomon, déchiffre et affiche le résultat.',
      album_h:'📦 Mode album (gros fichiers)',
      a1_t:'Sélectionner plusieurs images',a1_d:'Passez à l\'onglet <strong>"Album"</strong>. Sélectionnez 2+ images. L’appli calcule combien sont nécessaires.',
      a2_t:'Fichier divisé automatiquement',a2_d:'Le fichier est découpé en blocs, chacun chiffré indépendamment avec son propre salt/nonce.',
      a3_t:'Extraire de l\'album',a3_d:'Passez à <strong>"Extraction album"</strong>, entrez le PIN, sélectionnez toutes les images. Décodage parallèle et reassemblage.',
      tech_title:'Détails techniques',tech_sub:'Le pipeline cryptographique complet de Cryptoimg.',
      th_comp:'Composant',th_algo:'Algorithme',th_purpose:'Objectif',
      t1_c:'Dérivation de clé',t1_p:'PIN → stego key 256-bit + enc key 256-bit. Résistant GPU/ASIC.',
      t2_c:'Extension de clé',t2_p:'Dérive des clés séparées pour stégo et chiffrement depuis Argon2.',
      t3_c:'Chiffrement',t3_p:'Chiffrement authentifié. Nonce 12 octets, auth tag 16 octets.',
      t4_c:'Compression',t4_p:'Réduit la taille du payload. ~50-70% pour le texte.',
      t5_c:'Correction d’erreurs',t5_p:'Protection contre les modifications. 25% de surcharge.',
      t6_c:'Stéganographie',t6_p:'Données cachées dans les bits de poids faible. Statiquement indétectable.',
      t7_c:'Self-Test',t7_p:'Vérifie immédiatement après encodage que l’extraction est correcte.',
      t8_c:'Mode album',t8_p:'Divise les gros fichiers en plusieurs images. Chaque bloc chiffré indépendamment.',
      faq_title:'Questions fréquentes',
      faq1_q:'Les données sont vraiment cachées ?',faq1_a:'Cryptoimg utilise la stéganographie LSB dans les pixels filtrés par variance. Les changements sont statistiquement indétectables.',
      faq2_q:'Que se passe-t-il si je perds le PIN ?',faq2_a:'Les données sont perdues. Le PIN est le seul moyen de dériver la clé. Aucun backdoor ni récupération. C\'est volontaire.',
      faq3_q:'Puis-je partager sur les réseaux sociaux ?',faq3_a:'Les réseaux sociaux recompriment les images, détruisant les données cachées. Utilisez le partage sans perte.',
      faq4_q:'Comment est-ce différent du chiffrement ?',faq4_a:'Le chiffrement rend les données illisibles. La stéganographie les rend invisibles. Cryptoimg fait les deux.',
      faq5_q:'Quels formats fonctionnent ?',faq5_a:'Entrée : n\'importe quel (JPEG, PNG, WebP, AVIF, BMP, TIFF). Conversion auto. Sortie : PNG, WebP ou AVIF — sans perte.',
      faq6_q:'Quelque chose est envoyé à un serveur ?',faq6_a:'Non. Tout se passe dans le navigateur via Web Crypto API, WebAssembly et Canvas API. Zéro requête réseau.',
      don_title:'❤️ Soutenir Cryptoimg',don_sub:'Si l\'outil vous est utile, soutenez le développement.',
      don_warn:'Vérifiez toujours l\'adresse après la copie. N\'envoyez que BTC à l\'adresse Bitcoin, ETH à l\'adresse Ethereum et USDT (TRC-20) à l\'adresse TRON.',
      copy:'📋 Copier',app_title:'Lancer Cryptoimg',app_sub:'L’appli complète de stéganographie fonctionne directement dans votre navigateur.',
      footer_note:'Tout traitement se fait localement. Aucune donnée ne quitte votre appareil.'
    },
    es:{
      nav_how:'Cómo funciona',nav_guide:'Guía',nav_tech:'Tecnología',nav_faq:'FAQ',nav_launch:'Iniciar',
      hero_badge:'🔒 100% del lado del cliente · Sin servidor',
      hero_title:'Oculta cualquier archivo<br><em>en cualquier imagen</em>',
      hero_sub:'Esteganografía + AES-256-GCM + Argon2id + Reed-Solomon. Tus datos nunca salen de tu navegador.',
      hero_app:'🔐 Abrir app',hero_guide:'📖 Leer guía',
      how_title:'Cripto-esteganografía explicada',how_sub:'Protección multicapa: el cifrado hace los datos ilegibles, la esteganografía los hace invisibles.',
      pipe_file:'Tu archivo',pipe_deflate:'Deflate',pipe_stego:'Incrustación stego',pipe_output:'Imagen de salida',
      c1_t:'Compresión Deflate',c1_d:'Tu archivo se comprime con DEFLATE antes del cifrado, maximizando la cantidad de datos que caben en la imagen.',
      c2_t:'AES-256-GCM',c2_d:'Cifrado autenticado. Sin el PIN, los datos son inaccesibles. Cualquier manipulación se detecta via auth tag.',
      c3_t:'Argon2id KDF',c3_d:'El PIN se transforma en clave criptográfica via Argon2id — resistente a ataques GPU y ASIC.',
      c4_t:'Reed-Solomon ECC',c4_d:'Los códigos correctores de errores protegen contra modificaciones menores de la imagen.',
      guide_title:'Guía paso a paso',guide_sub:'Instrucciones completas para ocultar y extraer archivos.',
      enc_h:'🔐 Cómo ocultar un archivo (Cifrado)',
      e1_t:'Elegir imagen contenedor',e1_d:'Haz clic <strong>"Seleccionar imagen"</strong> y elige PNG, WebP o AVIF. JPEG se convierte automáticamente a sin pérdida.',
      e2_t:'Ingresa tus datos secretos',e2_d:'Alterna entre <strong>Texto</strong> y <strong>Archivo</strong>. Arrastra y suelta o haz clic para buscar.',
      e3_t:'Establecer código PIN',e3_d:'Ingresa y confirma tu PIN. Es lo <strong>único</strong> que necesitas recordar. El PIN nunca se almacena.',
      e4_t:'Elegir formato',e4_d:'<strong>PNG</strong> (sin pérdida, mejor), <strong>WebP</strong> (más pequeño) o <strong>AVIF</strong> (más reciente).',
      e5_t:'Cifrar y descargar',e5_d:'Haz clic <strong>"Cifrar"</strong>. La app: comprime → cifra → añade corrección → incrusta → verifica → descarga.',
      dec_h:'🔓 Cómo extraer un archivo (Descifrado)',
      d1_t:'Subir imagen stego',d1_d:'Haz clic <strong>"Seleccionar imagen"</strong> y elige la imagen con datos ocultos.',
      d2_t:'Ingresar PIN',d2_d:'Escribe el mismo PIN usado al cifrar. Argon2id deriva la clave de descifrado.',
      d3_t:'Extraer y descargar',d3_d:'Haz clic <strong>"Extraer"</strong>. La app lee, verifica Reed-Solomon, descifra y muestra el resultado.',
      album_h:'📦 Modo álbum (archivos grandes)',
      a1_t:'Seleccionar múltiples imágenes',a1_d:'Ve a la pestaña <strong>"Álbum"</strong>. Selecciona 2+ imágenes. La app calcula cuántas necesitas.',
      a2_t:'Archivo dividido automáticamente',a2_d:'El archivo se divide en bloques, cada uno cifrado independientemente con su propio salt/nonce.',
      a3_t:'Extraer del álbum',a3_d:'Ve a <strong>"Extraer álbum"</strong>, ingresa el PIN, selecciona todas las imágenes a la vez.',
      tech_title:'Detalles técnicos',tech_sub:'El pipeline criptográfico completo de Cryptoimg.',
      th_comp:'Componente',th_algo:'Algoritmo',th_purpose:'Propósito',
      t1_c:'Derivación de clave',t1_p:'PIN → stego key 256-bit + enc key 256-bit. Resistente GPU/ASIC.',
      t2_c:'Extensión de clave',t2_p:'Deriva claves separadas para stego y cifrado desde Argon2.',
      t3_c:'Cifrado',t3_p:'Cifrado autenticado. Nonce de 12 bytes, auth tag de 16 bytes.',
      t4_c:'Compresión',t4_p:'Reduce el tamaño del payload. ~50-70% en texto.',
      t5_c:'Corrección de errores',t5_p:'Protección contra modificaciones. 25% de sobrecarga.',
      t6_c:'Esteganografía',t6_p:'Datos ocultos en bits menos significativos. Estadísticamente indetectable.',
      t7_c:'Self-Test',t7_p:'Verifica inmediatamente después del cifrado que la extracción es correcta.',
      t8_c:'Modo álbum',t8_p:'Divide archivos grandes en múltiples imágenes. Cada bloque cifrado independientemente.',
      faq_title:'Preguntas frecuentes',
      faq1_q:'¿Los datos realmente están ocultos?',faq1_a:'Cryptoimg usa esteganografía LSB en píxeles filtrados por varianza. Los cambios son estadísticamente indetectables.',
      faq2_q:'¿Qué pasa si pierdo el PIN?',faq2_a:'Los datos se pierden. El PIN es la única forma de derivar la clave. No hay backdoor ni recuperación.',
      faq3_q:'¿Puedo compartir en redes sociales?',faq3_a:'Las redes sociales recomprimen las imágenes, destruyendo los datos ocultos. Usa transferencia sin pérdida.',
      faq4_q:'¿Cómo es diferente del cifrado normal?',faq4_a:'El cifrado hace datos ilegibles. La esteganografía los hace invisibles. Cryptoimg hace ambas cosas.',
      faq5_q:'¿Qué formatos de imagen funcionan?',faq5_a:'Entrada: cualquiera (JPEG, PNG, WebP, AVIF, BMP, TIFF). Conversión automática. Salida: PNG, WebP o AVIF — sin pérdida.',
      faq6_q:'¿Se envía algo a un servidor?',faq6_a:'No. Todo ocurre en el navegador via Web Crypto API, WebAssembly y Canvas API. Cero peticiones de red.',
      don_title:'❤️ Apoyar Cryptoimg',don_sub:'Si la herramienta te es útil, considera apoyar el desarrollo.',
      don_warn:'Siempre verifica la dirección después de copiar. Envía solo BTC a la dirección Bitcoin, ETH a la dirección Ethereum y USDT (TRC-20) a la dirección TRON.',
      copy:'📋 Copiar',app_title:'Iniciar Cryptoimg',app_sub:'La aplicación completa de esteganografía funciona directamente en tu navegador.',
      footer_note:'Todo el procesamiento ocurre localmente. Ningún dato sale de tu dispositivo.'
    },
    zh:{
      nav_how:'工作原理',nav_guide:'使用指南',nav_tech:'技术详情',nav_faq:'常见问题',nav_launch:'启动应用',
      hero_badge:'🔒 100% 客户端 · 零服务器',
      hero_title:'将任何文件隐藏<br><em>在任何图片中</em>',
      hero_sub:'隐写术 + AES-256-GCM 加密 + Argon2id 密钥派生 + Reed-Solomon 纠错。您的数据永远不会离开浏览器。',
      hero_app:'🔐 打开应用',hero_guide:'📖 阅读指南',
      how_title:'加密隐写术原理',how_sub:'多层保护：加密使数据不可读，隐写术使数据不可见。',
      pipe_file:'您的文件',pipe_deflate:'Deflate',pipe_stego:'隐写嵌入',pipe_output:'输出图像',
      c1_t:'Deflate 压缩',c1_d:'文件在加密前使用 DEFLATE 压缩，最大化图像中可容纳的数据量。',
      c2_t:'AES-256-GCM',c2_d:'认证加密。没有 PIN 无法读取数据。任何篡改都会通过认证标签检测到。',
      c3_t:'Argon2id KDF',c3_d:'PIN 通过 Argon2id 转换为加密密钥 — 抵抗 GPU 和 ASIC 攻击。',
      c4_t:'Reed-Solomon ECC',c4_d:'纠错码保护免受图像轻微修改（重新保存、格式转换）的影响。',
      guide_title:'分步使用指南',guide_sub:'从图片中隐藏和提取文件的完整操作流程。',
      enc_h:'🔐 如何隐藏文件（编码）',
      e1_t:'选择载体图像',e1_d:'点击<strong>"选择图像"</strong>，选择 PNG、WebP 或 AVIF 文件。JPEG 会自动转换为无损格式。',
      e2_t:'输入秘密数据',e2_d:'在<strong>文本</strong>和<strong>文件</strong>选项卡之间切换。文件支持拖放或点击浏览。',
      e3_t:'设置 PIN 码',e3_d:'输入并确认 PIN。这是您唯一需要记住的东西。PIN 永远不会存储 — 用于通过 Argon2id + HKDF 派生加密密钥。',
      e4_t:'选择输出格式',e4_d:'选择 <strong>PNG</strong>（无损，最佳）、<strong>WebP</strong>（更小）或 <strong>AVIF</strong>（最新）。',
      e5_t:'加密并下载',e5_d:'点击<strong>"加密"</strong>。应用将：压缩 → 加密 → 添加纠错 → 嵌入像素 → 自检验证 → 下载。',
      dec_h:'🔓 如何提取文件（解码）',
      d1_t:'上传隐写图像',d1_d:'点击<strong>"选择图像"</strong>，选择包含隐藏数据的图像。',
      d2_t:'输入 PIN',d2_d:'输入编码时使用的相同 PIN。Argon2id 将派生解密密钥。',
      d3_t:'提取并下载',d3_d:'点击<strong>"提取"</strong>。应用读取数据，验证 Reed-Solomon，解密并显示结果。',
      album_h:'📦 专辑模式（大文件）',
      a1_t:'选择多个载体图像',a1_d:'切换到<strong>"专辑编码"</strong>选项卡。选择 2+ 张图像。应用自动计算需要多少张。',
      a2_t:'文件自动分割',a2_d:'文件被分成多个块，每个块独立使用自己的 salt/nonce 加密。空白图像被跳过。',
      a3_t:'从专辑提取',a3_d:'切换到<strong>"专辑提取"</strong>选项卡，输入 PIN，一次选择所有图像。所有块并行解码并重新组装。',
      tech_title:'技术详情',tech_sub:'Cryptoimg 的完整加密流水线。',
      th_comp:'组件',th_algo:'算法',th_purpose:'用途',
      t1_c:'密钥派生',t1_p:'PIN → 256位 stego key + 256位 enc key。抗 GPU/ASIC。',
      t2_c:'密钥扩展',t2_p:'从 Argon2 输出派生独立的隐写密钥和加密密钥。',
      t3_c:'加密',t3_p:'认证加密。12字节 nonce，16字节认证标签。',
      t4_c:'压缩',t4_p:'在加密前减小数据大小。文本约 50-70% 压缩率。',
      t5_c:'纠错',t5_p:'保护免受图像修改。25% 开销。',
      t6_c:'隐写术',t6_p:'数据隐藏在最低有效位中。统计上不可检测。',
      t7_c:'自检',t7_p:'编码后立即验证提取是否正确。',
      t8_c:'专辑模式',t8_p:'将大文件分割为多个图像。每个块独立加密。',
      faq_title:'常见问题',
      faq1_q:'数据真的被隐藏了吗？',faq1_a:'Cryptoimg 使用方差过滤像素中的 LSB 隐写术。修改在统计上不可检测。',
      faq2_q:'如果忘记 PIN 怎么办？',faq2_a:'数据将丢失。PIN 是派生解密密钥的唯一方式。没有后门或恢复机制。这是有意设计的。',
      faq3_q:'可以在社交媒体上分享吗？',faq3_a:'社交媒体会重新压缩图像，可能破坏隐藏数据。请使用无损方式分享：电子邮件、云存储或直接传输。',
      faq4_q:'与普通加密有什么不同？',faq4_a:'加密使数据不可读。隐写术使数据不可见。Cryptoimg 两者兼备。',
      faq5_q:'支持哪些图像格式？',faq5_a:'输入：任意格式（JPEG、PNG、WebP、AVIF、BMP、TIFF）。自动转换。输出：PNG、WebP 或 AVIF — 均为无损。',
      faq6_q:'会向服务器发送数据吗？',faq6_a:'不会。一切都在浏览器中通过 Web Crypto API、WebAssembly 和 Canvas API 完成。零网络请求。',
      don_title:'❤️ 支持 Cryptoimg',don_sub:'如果这个工具对您有用，请考虑支持开发。',
      don_warn:'复制后请始终验证地址。仅向比特币地址发送 BTC，向以太坊地址发送 ETH，向 TRON 地址发送 USDT (TRC-20)。',
      copy:'📋 复制',app_title:'启动 Cryptoimg',app_sub:'全功能隐写应用直接在您的浏览器中运行。',
      footer_note:'所有处理均在本地进行。数据不会离开您的设备。'
    }
  };

  function applyLang(lang){
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k=el.getAttribute('data-i18n');
      if(T[lang]&&T[lang][k])el.innerHTML=T[lang][k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const k=el.getAttribute('data-i18n-html');
      if(T[lang]&&T[lang][k])el.innerHTML=T[lang][k];
    });
    // Update QR code addresses (same for all languages)
    genQR('qr-btc',ADDRS.btc);genQR('qr-eth',ADDRS.eth);genQR('qr-usdt',ADDRS.usdt);
    // Notify embedded React app of language change
    document.dispatchEvent(new CustomEvent('cryptoimg-lang-change',{detail:lang}));
  }

  document.getElementById('langSwitcher').addEventListener('change',e=>{applyLang(e.target.value);localStorage.setItem('cryptoimg-lang',e.target.value);});

  // Restore saved language
  const saved=localStorage.getItem('cryptoimg-lang');
  if(saved&&T[saved]){document.getElementById('langSwitcher').value=saved;applyLang(saved);}
  </script>
  <script src="./bundle.js"></script>
</body>
</html>`;

writeFileSync(resolve(__dir, 'WEB/index.html'), html);
console.log('✅ WEB/index.html rebuilt with i18n (RU/EN/DE/FR/ES/ZH) + tabbed donate with QR');
