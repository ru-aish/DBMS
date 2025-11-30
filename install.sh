#!/bin/bash

echo "============================================"
echo "BDSM - Donation Management System Installer"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/5] Node.js found: $(node --version)"
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "WARNING: MySQL command not found in PATH!"
    echo "Please ensure MySQL is installed and accessible."
    echo ""
fi

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
    echo ".env file created. Please edit it with your MySQL credentials."
    echo ""
else
    echo "[2/5] .env file already exists."
    echo ""
fi

# Install Node.js dependencies
echo "[3/5] Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    exit 1
fi
echo "Dependencies installed successfully."
echo ""

# Setup database
echo "[4/5] Setting up database..."
echo "Please ensure MySQL server is running."
echo ""
echo "To setup the database manually:"
echo "  1. Start MySQL server"
echo "  2. Run: mysql -u root -p < database.sql"
echo "  3. Update .env file with your MySQL credentials"
echo ""

read -p "Do you want to setup the database now? (y/n): " setup_db
if [[ $setup_db =~ ^[Yy]$ ]]; then
    read -p "Enter MySQL username (default: root): " mysql_user
    mysql_user=${mysql_user:-root}
    read -sp "Enter MySQL password: " mysql_password
    echo ""
    
    if [ -z "$mysql_password" ]; then
        mysql -u "$mysql_user" < database.sql
    else
        mysql -u "$mysql_user" -p"$mysql_password" < database.sql
    fi
    
    if [ $? -eq 0 ]; then
        echo "Database setup completed successfully!"
    else
        echo "WARNING: Database setup failed. Please setup manually."
    fi
    echo ""
else
    echo "Skipping database setup. Please setup manually later."
    echo ""
fi

echo "[5/5] Installation complete!"
echo ""
echo "============================================"
echo "Next Steps:"
echo "1. Edit .env file with your MySQL credentials"
echo "2. Ensure MySQL server is running"
echo "3. Run './start.sh' to start the application"
echo "============================================"
echo ""
