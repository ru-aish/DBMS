@echo off
echo ============================================
echo BDSM - Donation Management System
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please run install.bat first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please run install.bat first.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo Please run install.bat first.
    pause
    exit /b 1
)

echo Starting Donation Management System...
echo.
echo Backend will run on: http://localhost:3000
echo Frontend will be available at: http://localhost:3000/frontend
echo.
echo Press Ctrl+C to stop the server.
echo.

REM Start the backend server
node backend/server.js
