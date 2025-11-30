@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo BDSM - Donation Management System
echo ============================================
echo.

REM Get the directory where the script is located
cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo After installing, run install.bat first.
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please run install.bat first to create configuration.
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [ERROR] Dependencies not installed!
    echo Please run install.bat first.
    exit /b 1
)

REM Check if backend/server.js exists
if not exist "backend\server.js" (
    echo [ERROR] backend\server.js not found!
    echo Please ensure the project files are intact.
    exit /b 1
)

REM Read BACKEND_PORT from .env file (default 3000)
set "BACKEND_PORT=3000"
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if /i "%%a"=="BACKEND_PORT" set "BACKEND_PORT=%%b"
)

REM Read MYSQL_PORT from .env file (default 3306)
set "MYSQL_PORT=3306"
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if /i "%%a"=="MYSQL_PORT" set "MYSQL_PORT=%%b"
)

echo [INFO] Configuration:
echo       Backend Port: !BACKEND_PORT!
echo       MySQL Port:   !MYSQL_PORT!
echo.

echo [1/3] Stopping any previous server instances...

REM Kill process on port using netstat
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":!BACKEND_PORT!.*LISTENING"') do (
    echo       Killing process on port !BACKEND_PORT! (PID: %%a)
    taskkill /F /PID %%a >nul 2>nul
)

REM Wait for port to be released
timeout /t 2 /nobreak >nul
echo       [OK] Previous instances cleaned up
echo.

echo [2/3] Verifying port !BACKEND_PORT! is available...
netstat -aon 2>nul | findstr ":!BACKEND_PORT!.*LISTENING" >nul 2>nul
if %errorlevel% equ 0 (
    echo [WARNING] Port !BACKEND_PORT! is still in use!
    echo          Please close any application using port !BACKEND_PORT!.
    echo          Or wait a moment and try again.
    echo.
    timeout /t 3 /nobreak >nul
)
echo       [OK] Port check complete
echo.

echo [3/3] Starting server...
echo.
echo ============================================
echo Server starting on http://localhost:!BACKEND_PORT!
echo ============================================
echo.
echo Portal URLs:
echo   Admin:     http://localhost:!BACKEND_PORT!/frontend/ADMIN/index.html
echo   Donor:     http://localhost:!BACKEND_PORT!/frontend/donor-portal/index.html
echo   Recipient: http://localhost:!BACKEND_PORT!/frontend/recipient-portal/index.html
echo.
echo Press Ctrl+C to stop the server.
echo ============================================
echo.

REM Start the backend server
node backend/server.js

REM If node exits with error
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server stopped unexpectedly!
    echo.
    echo Common issues:
    echo   1. Port !BACKEND_PORT! already in use
    echo   2. MySQL not running on port !MYSQL_PORT!
    echo   3. Invalid .env configuration
    echo.
    echo Check the error message above for details.
)

endlocal
