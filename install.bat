@echo off
REM ============================================================================
REM BDSM - Student Resource Donation Management System
REM Installation Script for Windows
REM ============================================================================

echo ==========================================
echo   BDSM Installation Script
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed!
    echo Please install npm (comes with Node.js)
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo [INFO] Node.js version: %NODE_VERSION%
echo [INFO] npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo [INFO] Installing dependencies...
echo.

call npm install

if %ERRORLEVEL% equ 0 (
    echo.
    echo ==========================================
    echo   Installation Complete!
    echo ==========================================
    echo.
    echo Installed packages:
    echo   - express (Web framework)
    echo   - mysql2 (MySQL driver)
    echo   - cors (CORS middleware)
    echo   - body-parser (Request parser)
    echo   - bcrypt (Password hashing)
    echo   - dotenv (Environment config)
    echo.
    echo To start the application:
    echo   1. Start MySQL/XAMPP
    echo   2. Import database: mysql -u root ^< database-v2.sql
    echo   3. Start backend: npm run start-backend
    echo   4. Start frontend: npx serve frontend -l 8080
    echo.
) else (
    echo.
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)

pause
