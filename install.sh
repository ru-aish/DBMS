#!/bin/bash

# ============================================================================
# BDSM - Student Resource Donation Management System
# Installation Script for Linux/Mac
# ============================================================================

echo "=========================================="
echo "  BDSM Installation Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not installed!"
    echo "Please install npm (comes with Node.js)"
    exit 1
fi

echo "[INFO] Node.js version: $(node -v)"
echo "[INFO] npm version: $(npm -v)"
echo ""

# Install dependencies
echo "[INFO] Installing dependencies..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  Installation Complete!"
    echo "=========================================="
    echo ""
    echo "Installed packages:"
    echo "  - express (Web framework)"
    echo "  - mysql2 (MySQL driver)"
    echo "  - cors (CORS middleware)"
    echo "  - body-parser (Request parser)"
    echo "  - bcrypt (Password hashing)"
    echo "  - dotenv (Environment config)"
    echo ""
    echo "To start the application:"
    echo "  1. Start MySQL/XAMPP"
    echo "  2. Import database: mysql -u root < database-v2.sql"
    echo "  3. Start backend: npm run start-backend"
    echo "  4. Start frontend: npx serve frontend -l 8080"
    echo ""
else
    echo ""
    echo "[ERROR] Installation failed!"
    exit 1
fi
