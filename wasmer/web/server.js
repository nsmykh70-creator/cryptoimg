const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 8080;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.apk':  'application/vnd.android.package-archive',
  '.exe':  'application/octet-stream',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

const COMPRESS_EXT = new Set(['.html', '.js', '.css', '.json', '.svg', '.ico', '.woff2']);

// Security: allowlist of static files to serve
const ALLOWED_FILES = new Set([
  'index.html', 'bundle.v2.js', 'favicon.svg',
  'robots.txt', 'llms.txt', 'server.js', 'package.json',
  'qrcode.min.js', 'app.css'
]);
const ALLOWED_DIRS = new Set(['windows', 'android']);
const CACHE_MAP = {
  '.html': 'no-cache',
  '.js':   'public, max-age=3600',
  '.css':  'public, max-age=31536000, immutable',
  '.svg':  'public, max-age=31536000, immutable',
  '.woff2':'public, max-age=31536000, immutable',
  '.apk':  'public, max-age=86400',
  '.exe':  'public, max-age=86400',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // CSP: script-src only (Tailwind uses unsafe-inline for styles)
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none';",
};

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';

  // robots.txt
  if (url === '/robots.txt') {
    const robots = 'User-agent: *\nAllow: /\n\nSitemap: https://cryptoimg.wasmer.app/sitemap.xml\n';
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' });
    res.end(robots);
    return;
  }

  // security.txt
  if (url === '/.well-known/security.txt') {
    const stxt = 'Contact: https://cryptoimg.wasmer.app/\nExpires: 2027-09-01T00:00:00.000Z\nPreferred-Languages: en, ru, de, fr, es, zh\nPolicy: https://cryptoimg.wasmer.app/llms.txt\n';
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' });
    res.end(stxt);
    return;
  }

  // Security: prevent path traversal
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relativePath = pathname.replace(/^\/+/, '');
  const filePath = path.resolve(__dirname, relativePath);

  // Check: path must stay inside __dirname
  if (filePath !== __dirname && !filePath.startsWith(__dirname + path.sep)) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(__dirname, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not Found'); return; }
        const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', ...SECURITY_HEADERS };
        res.writeHead(200, headers);
        res.end(d2);
      });
      return;
    }

    const contentType = MIME[ext] || 'application/octet-stream';
    const cacheControl = CACHE_MAP[ext] || 'public, max-age=3600';

    // Gzip compression for text-based assets
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (COMPRESS_EXT.has(ext) && acceptEncoding.includes('gzip')) {
      zlib.gzip(data, { level: 6 }, (err, compressed) => {
        if (err) {
          // Fallback to uncompressed
          res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': cacheControl, ...SECURITY_HEADERS });
          res.end(data);
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Encoding': 'gzip',
          'Content-Length': compressed.length,
          'Cache-Control': cacheControl,
          'Vary': 'Accept-Encoding',
          ...SECURITY_HEADERS,
        });
        res.end(compressed);
      });
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': data.length,
        'Cache-Control': cacheControl,
        ...SECURITY_HEADERS,
      });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Cryptoimg running on port ${PORT}`);
});
