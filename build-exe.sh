#!/usr/bin/env bash
set -e

echo "========================================================"
echo "        Cryptoimg Desktop v5.1 - Windows EXE Build"
echo "========================================================"
echo ""

echo "[1/3] Installing dependencies..."
npm install

echo ""
echo "[2/3] Compiling React + Vite bundle..."
npm run build

echo ""
echo "[3/3] Packaging Windows EXE via electron-builder..."
npx electron-builder --win --config electron-builder.json

echo ""
echo "========================================================"
echo " BUILD SUCCESSFUL!"
echo " Binaries created in 'release/' directory:"
echo "   - release/Cryptoimg-5.1.0-x64.exe"
echo "   - release/Cryptoimg-Portable-v5.1.0.exe"
echo "========================================================"
