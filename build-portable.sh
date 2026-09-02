#!/usr/bin/env bash
set -e

echo "========================================================"
echo "    Cryptoimg Desktop v5.1 - Standalone PORTABLE Build"
echo "========================================================"
echo ""

echo "[1/3] Installing dependencies..."
npm install

echo ""
echo "[2/3] Compiling React + Vite bundle..."
npm run build

echo ""
echo "[3/3] Packaging Standalone Portable .EXE..."
npx electron-builder --win portable --config electron-builder.json

echo ""
echo "========================================================"
echo " PORTABLE BUILD SUCCESSFUL!"
echo " Output:"
echo "   - release/Cryptoimg-Portable-v5.1.0.exe"
echo "========================================================"
