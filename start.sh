#!/bin/bash

echo "============================================"
echo "BDSM - Donation Management System"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please run install.sh first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    echo "Please run install.sh first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "ERROR: Dependencies not installed!"
    echo "Please run install.sh first."
    exit 1
fi

echo "Checking for previous server instances..."
# Kill any previous server processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
# Also kill by process name (backup method)
pkill -f "node backend/server.js" 2>/dev/null || true
sleep 1
echo "✓ Cleaned up previous instances"
echo ""

echo "Starting Donation Management System..."
echo ""
echo "Backend will run on: http://localhost:3000"
echo "Frontend will be available at: http://localhost:3000/frontend"
echo ""
echo "Portal URLs:"
echo "  Admin:     http://localhost:3000/frontend/ADMIN/index.html"
echo "  Donor:     http://localhost:3000/frontend/donor-portal/index.html"
echo "  Recipient: http://localhost:3000/frontend/recipient-portal/index.html"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

# Start the backend server
node backend/server.js
