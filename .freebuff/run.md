# Preview Run Doc — Cryptoimg Desktop v5.1

## How to Reproduce Uncommitted Artifacts

### Critical Fix: `base: './'` in vite.config.ts
Without this, Vite builds with absolute asset paths (`/assets/...`) which don't work in Electron's `loadFile()` mode. The fix sets `base: './'` so all asset references become relative (`./assets/...`).

### Watch Ignore
`release/` and `dist/` are ignored in Vite's file watcher to prevent EBUSY crashes from Electron session files.

## How to Run the Dev Server

```
npx vite --port=3000 --host=0.0.0.0
```

Or use the npm script:
```
npm run dev
```

### Windows Detach (PowerShell)

```powershell
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WorkingDirectory '<PROJECT_DIR>' -WindowStyle Hidden -PassThru).Id"
```

Confirm alive:
```powershell
powershell -NoProfile -Command "Get-Process -Id <pid>"
```

### How to Build Portable

```bash
# Standard build (may fail if Windows Defender blocks electron extraction):
npm run dist:portable

# Workaround for Windows Defender:
# 1. Add C:\electron-build\release to Defender exclusions, OR
# 2. Temporarily modify electron-builder.json output to C:\electron-build\release
# 3. Build: npx electron-builder --win portable --config electron-builder.json
# 4. Copy result to release/ and restore electron-builder.json
```

### Preview Registration

Register with `register_preview` using `url: http://localhost:3000` and the server's PID from `netstat`.
