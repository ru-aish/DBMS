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
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please run install.bat first.
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo Please run install.bat first.
    exit /b 1
)

echo Checking for previous server instances...
REM Kill any Node.js process running on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
REM Also kill by process name (backup method)
taskkill /F /IM node.exe /FI "WINDOWTITLE eq backend/server.js*" 2>nul
timeout /t 1 /nobreak >nul
echo + Cleaned up previous instances
echo.

echo Starting Donation Management System...
echo.
echo Backend will run on: http://localhost:3000
echo Frontend will be available at: http://localhost:3000/frontend
echo.
echo Portal URLs:
echo   Admin:     http://localhost:3000/frontend/ADMIN/index.html
echo   Donor:     http://localhost:3000/frontend/donor-portal/index.html
echo   Recipient: http://localhost:3000/frontend/recipient-portal/index.html
echo.
echo Press Ctrl+C to stop the server.
echo.

REM Start the backend server
node backend/server.js
