@echo off
title Lucina AI - Next.js 14 Frontend
cd /d "%~dp0frontend"
echo Installing frontend dependencies if needed...
call npm install
echo Starting Next.js Dev Server on port 3000...
call npm run dev
pause
