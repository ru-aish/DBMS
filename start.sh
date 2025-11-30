#!/bin/bash

echo "============================================"
echo "BDSM - Donation Management System"
echo "============================================"
echo ""

# Get the directory where the script is located
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    echo "After installing, run ./install.sh first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "[ERROR] .env file not found!"
    echo "Please run ./install.sh first to create configuration."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[ERROR] Dependencies not installed!"
    echo "Please run ./install.sh first."
    exit 1
fi

# Check if backend/server.js exists
if [ ! -f "backend/server.js" ]; then
    echo "[ERROR] backend/server.js not found!"
    echo "Please ensure the project files are intact."
    exit 1
fi

# Read BACKEND_PORT from .env file (default 3000)
BACKEND_PORT=$(grep -E "^BACKEND_PORT=" .env 2>/dev/null | cut -d'=' -f2 | tr -d '[:space:]')
BACKEND_PORT=${BACKEND_PORT:-3000}

# Read MYSQL_PORT from .env file (default 3306)
MYSQL_PORT=$(grep -E "^MYSQL_PORT=" .env 2>/dev/null | cut -d'=' -f2 | tr -d '[:space:]')
MYSQL_PORT=${MYSQL_PORT:-3306}

echo "[INFO] Configuration:"
echo "      Backend Port: $BACKEND_PORT"
echo "      MySQL Port:   $MYSQL_PORT"
echo ""

echo "[1/3] Stopping any previous server instances..."

# Method 1: Kill process on the configured port
if command -v lsof &> /dev/null; then
    PID=$(lsof -ti:$BACKEND_PORT 2>/dev/null)
    if [ -n "$PID" ]; then
        echo "      Killing process on port $BACKEND_PORT (PID: $PID)"
        kill -9 $PID 2>/dev/null
    fi
elif command -v fuser &> /dev/null; then
    fuser -k $BACKEND_PORT/tcp 2>/dev/null
fi

# Method 2: Kill by process name
pkill -f "node backend/server.js" 2>/dev/null

# Wait for port to be released
sleep 2
echo "      [OK] Previous instances cleaned up"
echo ""

echo "[2/3] Verifying port $BACKEND_PORT is available..."
if command -v lsof &> /dev/null; then
    if lsof -i:$BACKEND_PORT &> /dev/null; then
        echo "[WARNING] Port $BACKEND_PORT is still in use!"
        echo "         Please close any application using port $BACKEND_PORT."
        echo "         Or wait a moment and try again."
        echo ""
        sleep 3
    fi
elif command -v netstat &> /dev/null; then
    if netstat -tuln 2>/dev/null | grep -q ":$BACKEND_PORT "; then
        echo "[WARNING] Port $BACKEND_PORT is still in use!"
        echo ""
        sleep 3
    fi
fi
echo "      [OK] Port check complete"
echo ""

echo "[3/3] Starting server..."
echo ""
echo "============================================"
echo "Server starting on http://localhost:$BACKEND_PORT"
echo "============================================"
echo ""
echo "Portal URLs:"
echo "  Admin:     http://localhost:$BACKEND_PORT/frontend/ADMIN/index.html"
echo "  Donor:     http://localhost:$BACKEND_PORT/frontend/donor-portal/index.html"
echo "  Recipient: http://localhost:$BACKEND_PORT/frontend/recipient-portal/index.html"
echo ""
echo "Press Ctrl+C to stop the server."
echo "============================================"
echo ""

# Start the backend server
node backend/server.js

# If node exits with error
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "[ERROR] Server stopped unexpectedly! (Exit code: $EXIT_CODE)"
    echo ""
    echo "Common issues:"
    echo "  1. Port $BACKEND_PORT already in use"
    echo "  2. MySQL not running on port $MYSQL_PORT"
    echo "  3. Invalid .env configuration"
    echo ""
    echo "Check the error message above for details."
fi
