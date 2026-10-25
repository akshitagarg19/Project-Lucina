@echo off
title Lucina AI - Test Runner
cd /d "%~dp0backend"
echo Running backend test suite...
python -u tests\test_api_endpoints.py
echo.
pause
