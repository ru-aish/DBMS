@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo BDSM - Donation Management System Installer
echo ============================================
echo.

REM Get the directory where the script is located
cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo Download the LTS version and run the installer.
    echo.
    echo After installing Node.js, run this script again.
    exit /b 1
)

echo [1/5] Node.js found:
node --version
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] MySQL command not found in PATH!
    echo          Please ensure MySQL is installed and accessible.
    echo          Download from: https://dev.mysql.com/downloads/installer/
    echo.
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo [2/5] Creating .env configuration file...
    (
        echo MYSQL_HOST=localhost
        echo MYSQL_USER=root
        echo MYSQL_PASSWORD=
        echo MYSQL_DATABASE=donation_system
        echo BACKEND_PORT=3000
    ) > .env
    echo       [OK] .env file created
    echo       Please edit .env with your MySQL credentials if needed.
    echo.
) else (
    echo [2/5] .env file already exists.
    echo.
)

REM Install Node.js dependencies
echo [3/5] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    echo        Check your internet connection and try again.
    exit /b 1
)
echo       [OK] Dependencies installed successfully.
echo.

REM Setup database
echo [4/5] Database Setup
echo.
echo Please ensure MySQL server is running before continuing.
echo.
echo To setup the database manually later:
echo   1. Start MySQL server
echo   2. Run: mysql -u root -p ^< database.sql
echo   3. Update .env file with your MySQL credentials
echo.
choice /C YN /M "Do you want to setup the database now"
if errorlevel 2 goto skip_db
if errorlevel 1 goto setup_db

:setup_db
set /p "mysql_user=Enter MySQL username (default: root): "
if "!mysql_user!"=="" set mysql_user=root

set /p "mysql_password=Enter MySQL password (leave empty if none): "

if "!mysql_password!"=="" (
    mysql -u !mysql_user! < database.sql 2>nul
) else (
    mysql -u !mysql_user! -p!mysql_password! < database.sql 2>nul
)

if %errorlevel% equ 0 (
    echo       [OK] Database setup completed successfully!
) else (
    echo       [WARNING] Database setup may have failed.
    echo                 You can set it up manually later.
)
echo.
goto continue

:skip_db
echo       Skipping database setup. Please setup manually later.
echo.

:continue
echo [5/5] Installation complete!
echo.
echo ============================================
echo SUCCESS! Installation finished.
echo ============================================
echo.
echo Next Steps:
echo   1. Ensure MySQL server is running
echo   2. Edit .env if you need to change MySQL credentials
echo   3. Run "start.bat" to start the application
echo.
echo ============================================

endlocal
