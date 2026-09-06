@echo off
cd /d "%~dp0.."
npx vite --port=5173 --host=0.0.0.0
