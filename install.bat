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

REM Check if MySQL is installed and find it
set "MYSQL_CMD=mysql"
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    REM Try common XAMPP paths
    if exist "C:\xampp\mysql\bin\mysql.exe" (
        set "MYSQL_CMD=C:\xampp\mysql\bin\mysql.exe"
        echo [INFO] Found MySQL at C:\xampp\mysql\bin\mysql.exe
    ) else if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
        set "MYSQL_CMD=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
        echo [INFO] Found MySQL at Program Files
    ) else if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" (
        set "MYSQL_CMD=C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
        echo [INFO] Found MySQL at Program Files
    ) else (
        echo [WARNING] MySQL command not found!
        echo          Checked locations:
        echo            - System PATH
        echo            - C:\xampp\mysql\bin\
        echo            - C:\Program Files\MySQL\
        echo.
        echo          Please ensure MySQL/XAMPP is installed.
        echo.
    )
) else (
    echo [INFO] MySQL found in PATH
)
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo [2/5] Creating .env configuration file...
    (
        echo MYSQL_HOST=localhost
        echo MYSQL_PORT=3306
        echo MYSQL_USER=root
        echo MYSQL_PASSWORD=
        echo MYSQL_DATABASE=donation_system
        echo BACKEND_PORT=3000
        echo HOST=0.0.0.0
    ) > .env
    echo       [OK] .env file created
    echo       Please edit .env with your MySQL credentials if needed.
    echo.
) else (
    echo [2/5] .env file already exists.
    echo.
)

REM Read MySQL settings from .env
set "MYSQL_HOST=localhost"
set "MYSQL_PORT=3306"
set "MYSQL_DATABASE=donation_system"
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if /i "%%a"=="MYSQL_HOST" set "MYSQL_HOST=%%b"
    if /i "%%a"=="MYSQL_PORT" set "MYSQL_PORT=%%b"
    if /i "%%a"=="MYSQL_DATABASE" set "MYSQL_DATABASE=%%b"
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
echo ============================================
echo MySQL Configuration (from .env):
echo   Host:     !MYSQL_HOST!
echo   Port:     !MYSQL_PORT!
echo   Database: !MYSQL_DATABASE!
echo ============================================
echo.
echo Please ensure MySQL/XAMPP server is RUNNING before continuing.
echo.
choice /C YN /M "Do you want to setup the database now"
if errorlevel 2 goto skip_db
if errorlevel 1 goto setup_db

:setup_db
echo.
set /p "mysql_user=Enter MySQL username [root]: "
if "!mysql_user!"=="" set "mysql_user=root"

set /p "mysql_password=Enter MySQL password [empty]: "

echo.
echo [INFO] Connecting to MySQL at !MYSQL_HOST!:!MYSQL_PORT!...
echo.

REM Build the MySQL command with proper parameters
set "MYSQL_PARAMS=-h !MYSQL_HOST! -P !MYSQL_PORT! -u !mysql_user!"
if not "!mysql_password!"=="" set "MYSQL_PARAMS=!MYSQL_PARAMS! -p!mysql_password!"

REM Test MySQL connection first
echo [INFO] Testing MySQL connection...
"!MYSQL_CMD!" !MYSQL_PARAMS! -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Cannot connect to MySQL!
    echo.
    echo Possible causes:
    echo   1. MySQL/XAMPP is not running
    echo   2. Wrong username or password
    echo   3. MySQL is on a different port
    echo   4. Firewall blocking connection
    echo.
    echo Please check:
    echo   - XAMPP Control Panel shows MySQL as "Running" (green)
    echo   - Your username and password are correct
    echo   - Port !MYSQL_PORT! is correct in .env file
    echo.
    echo You can setup the database manually later:
    echo   "!MYSQL_CMD!" -u root -p ^< database.sql
    echo.
    goto continue
)

echo       [OK] MySQL connection successful!
echo.

REM Now run the database script
echo [INFO] Creating database and tables...
"!MYSQL_CMD!" !MYSQL_PARAMS! < database.sql

if %errorlevel% equ 0 (
    echo.
    echo       [OK] Database "!MYSQL_DATABASE!" created successfully!
    echo       [OK] All tables created!
    echo.
    
    REM Verify tables were created
    echo [INFO] Verifying tables...
    "!MYSQL_CMD!" !MYSQL_PARAMS! -e "USE !MYSQL_DATABASE!; SHOW TABLES;"
    echo.
) else (
    echo.
    echo [ERROR] Database setup failed!
    echo.
    echo The SQL script encountered an error.
    echo Check if the database already exists or if there are permission issues.
    echo.
    echo You can try manually:
    echo   "!MYSQL_CMD!" -u !mysql_user! -p ^< database.sql
    echo.
)
goto continue

:skip_db
echo.
echo       Skipping database setup.
echo.
echo To setup manually later, run:
echo   mysql -h !MYSQL_HOST! -P !MYSQL_PORT! -u root -p ^< database.sql
echo.

:continue
echo [5/5] Installation complete!
echo.
echo ============================================
echo SUCCESS! Installation finished.
echo ============================================
echo.
echo Next Steps:
echo   1. Ensure MySQL/XAMPP is running
echo   2. Edit .env if you need to change credentials
echo   3. Run "start.bat" to start the application
echo.
echo Quick Test:
echo   start.bat
echo   Then open: http://localhost:3000
echo.
echo ============================================

endlocal
