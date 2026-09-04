# Cryptoimg — Wasmer Deployment

## Static File Hosting (wasmer.io/apps/nsmykh70/staticfile-ea099)

Upload these files to Wasmer Staticfile:

```
wasmer-deploy/
├── index.html        (172 KB) — Landing page + React app
├── bundle.v2.js      (458 KB) — React application bundle
├── qrcode.min.js     (20 KB)  — QR code library
├── favicon.svg       (733 B)  — App icon
├── llms.txt          (1.5 KB) — AI/LLM description
└── robots.txt        (297 B)  — Search engine directives
```

## How to Deploy

### Option 1: Wasmer Web UI
1. Go to https://wasmer.io/apps/nsmykh70/staticfile-ea099
2. Upload all files from `wasmer-deploy/` folder
3. Done — app is live

### Option 2: Wasmer CLI
```bash
cd wasmer-deploy
wasmer deploy
```

### Option 3: Wasmer.toml (Node.js server)
If using Wasmer Edge with Node.js:
```toml
[package]
name = "cryptoimg"
version = "5.2.0"
description = "Hide Any Secret Inside Any Image"
license = "MIT"

[fs]
public_dir = "."

[deploy]
command = "node server.js"
```

## Notes
- `bundle.js` is legacy (v1), not needed for deployment
- `server.js` is only needed for Node.js hosting, not static file hosting
- All crypto runs client-side — no server-side processing required
