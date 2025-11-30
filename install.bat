@echo off
echo ============================================
echo BDSM - Donation Management System Installer
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo [1/5] Node.js found: 
node --version
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: MySQL command not found in PATH!
    echo Please ensure MySQL is installed and accessible.
    echo You can download MySQL from https://dev.mysql.com/downloads/installer/
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo [2/5] Creating .env configuration file...
    (
        echo MYSQL_HOST=localhost
        echo MYSQL_USER=root
        echo MYSQL_PASSWORD=
        echo MYSQL_DATABASE=donation_system
        echo BACKEND_PORT=3000
    ) > .env
    echo .env file created. Please edit it with your MySQL credentials.
    echo.
) else (
    echo [2/5] .env file already exists.
    echo.
)

REM Install Node.js dependencies
echo [3/5] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    exit /b 1
)
echo Dependencies installed successfully.
echo.

REM Setup database
echo [4/5] Setting up database...
echo Please ensure MySQL server is running.
echo.
echo To setup the database manually:
echo   1. Start MySQL server
echo   2. Run: mysql -u root -p ^< database.sql
echo   3. Update .env file with your MySQL credentials
echo.
choice /C YN /M "Do you want to setup the database now"
if errorlevel 2 goto skip_db
if errorlevel 1 goto setup_db

:setup_db
set /p mysql_user="Enter MySQL username (default: root): " || set mysql_user=root
set /p mysql_password="Enter MySQL password: "

if "%mysql_password%"=="" (
    mysql -u %mysql_user% < database.sql
) else (
    mysql -u %mysql_user% -p%mysql_password% < database.sql
)

if %errorlevel% equ 0 (
    echo Database setup completed successfully!
) else (
    echo WARNING: Database setup failed. Please setup manually.
)
echo.
goto continue

:skip_db
echo Skipping database setup. Please setup manually later.
echo.

:continue
echo [5/5] Installation complete!
echo.
echo ============================================
echo Next Steps:
echo 1. Edit .env file with your MySQL credentials
echo 2. Ensure MySQL server is running
echo 3. Run "start.bat" to start the application
echo ============================================
echo.
