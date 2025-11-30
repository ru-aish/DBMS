#!/bin/bash

echo "============================================"
echo "BDSM - Donation Management System Installer"
echo "============================================"
echo ""

# Get the directory where the script is located
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/5] Node.js found: $(node --version)"
echo ""

# Check if MySQL is installed
MYSQL_CMD="mysql"
if ! command -v mysql &> /dev/null; then
    # Try common XAMPP paths on Linux
    if [ -x "/opt/lampp/bin/mysql" ]; then
        MYSQL_CMD="/opt/lampp/bin/mysql"
        echo "[INFO] Found MySQL at /opt/lampp/bin/mysql"
    else
        echo "[WARNING] MySQL command not found in PATH!"
        echo "         Please ensure MySQL/XAMPP is installed and accessible."
        echo ""
    fi
else
    echo "[INFO] MySQL found in PATH"
fi
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "[2/5] Creating .env configuration file..."
    cat > .env << EOF
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=donation_system
BACKEND_PORT=3000
HOST=0.0.0.0
EOF
    echo "      [OK] .env file created"
    echo "      Please edit .env with your MySQL credentials if needed."
    echo ""
else
    echo "[2/5] .env file already exists."
    echo ""
fi

# Read MySQL settings from .env
MYSQL_HOST=$(grep -E "^MYSQL_HOST=" .env 2>/dev/null | cut -d'=' -f2 | tr -d '[:space:]')
MYSQL_HOST=${MYSQL_HOST:-localhost}

MYSQL_PORT=$(grep -E "^MYSQL_PORT=" .env 2>/dev/null | cut -d'=' -f2 | tr -d '[:space:]')
MYSQL_PORT=${MYSQL_PORT:-3306}

MYSQL_DATABASE=$(grep -E "^MYSQL_DATABASE=" .env 2>/dev/null | cut -d'=' -f2 | tr -d '[:space:]')
MYSQL_DATABASE=${MYSQL_DATABASE:-donation_system}

# Install Node.js dependencies
echo "[3/5] Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies!"
    exit 1
fi
echo "      [OK] Dependencies installed successfully."
echo ""

# Setup database
echo "[4/5] Database Setup"
echo ""
echo "============================================"
echo "MySQL Configuration (from .env):"
echo "  Host:     $MYSQL_HOST"
echo "  Port:     $MYSQL_PORT"
echo "  Database: $MYSQL_DATABASE"
echo "============================================"
echo ""
echo "Please ensure MySQL/XAMPP server is RUNNING before continuing."
echo ""

read -p "Do you want to setup the database now? (y/n): " setup_db
if [[ $setup_db =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter MySQL username [root]: " mysql_user
    mysql_user=${mysql_user:-root}
    
    read -sp "Enter MySQL password [empty]: " mysql_password
    echo ""
    
    echo ""
    echo "[INFO] Connecting to MySQL at $MYSQL_HOST:$MYSQL_PORT..."
    echo ""
    
    # Build MySQL command parameters
    MYSQL_PARAMS="-h $MYSQL_HOST -P $MYSQL_PORT -u $mysql_user"
    if [ -n "$mysql_password" ]; then
        MYSQL_PARAMS="$MYSQL_PARAMS -p$mysql_password"
    fi
    
    # Test MySQL connection first
    echo "[INFO] Testing MySQL connection..."
    $MYSQL_CMD $MYSQL_PARAMS -e "SELECT 1;" &> /dev/null
    if [ $? -ne 0 ]; then
        echo ""
        echo "[ERROR] Cannot connect to MySQL!"
        echo ""
        echo "Possible causes:"
        echo "  1. MySQL/XAMPP is not running"
        echo "  2. Wrong username or password"
        echo "  3. MySQL is on a different port"
        echo "  4. Need socket path for XAMPP (add MYSQL_SOCKET to .env)"
        echo ""
        echo "For XAMPP on Linux, you may need to add to .env:"
        echo "  MYSQL_SOCKET=/opt/lampp/var/mysql/mysql.sock"
        echo ""
        echo "You can setup the database manually later:"
        echo "  $MYSQL_CMD -u root -p < database.sql"
        echo ""
    else
        echo "      [OK] MySQL connection successful!"
        echo ""
        
        # Now run the database script
        echo "[INFO] Creating database and tables..."
        $MYSQL_CMD $MYSQL_PARAMS < database.sql
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "      [OK] Database '$MYSQL_DATABASE' created successfully!"
            echo "      [OK] All tables created!"
            echo ""
            
            # Verify tables were created
            echo "[INFO] Verifying tables..."
            $MYSQL_CMD $MYSQL_PARAMS -e "USE $MYSQL_DATABASE; SHOW TABLES;"
            echo ""
        else
            echo ""
            echo "[ERROR] Database setup failed!"
            echo ""
            echo "The SQL script encountered an error."
            echo "Check if the database already exists or if there are permission issues."
            echo ""
        fi
    fi
else
    echo ""
    echo "      Skipping database setup."
    echo ""
    echo "To setup manually later, run:"
    echo "  mysql -h $MYSQL_HOST -P $MYSQL_PORT -u root -p < database.sql"
    echo ""
fi

echo "[5/5] Installation complete!"
echo ""
echo "============================================"
echo "SUCCESS! Installation finished."
echo "============================================"
echo ""
echo "Next Steps:"
echo "  1. Ensure MySQL/XAMPP is running"
echo "  2. Edit .env if you need to change credentials"
echo "  3. Run './start.sh' to start the application"
echo ""
echo "Quick Test:"
echo "  ./start.sh"
echo "  Then open: http://localhost:3000"
echo ""
echo "============================================"
