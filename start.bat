@echo off
title Lucina AI - Full Platform Launcher
echo ========================================================
echo               LUCINA AI &bull; PLATFORM LAUNCHER
echo      Interdisciplinary Endocrine & Athletic Engine
echo ========================================================
echo.

cd /d "%~dp0backend"

echo [1/3] Checking Python installation...
python --version
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.11+.
    pause
    exit /b 1
)

echo.
echo [2/3] Verifying database and pre-trained analytical models...
python run_tests.py
if errorlevel 1 (
    echo [WARNING] Test verification encountered an issue. Starting server anyway...
)

echo.
echo [3/3] Launching Lucina AI Server at http://localhost:8000 ...
echo [INFO] Swagger API Documentation: http://localhost:8000/docs
echo [INFO] Interactive Dashboard:     http://localhost:8000/
echo.

start "" "http://localhost:8000"
python main.py

pause
