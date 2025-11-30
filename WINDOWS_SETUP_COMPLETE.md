# Windows Installation Complete! 🎉

Your BDSM (Basic Donation System Management) is now fully configured for Windows with just two simple scripts.

## What Was Done

### 1. Created Windows Scripts
- **install.bat** - One-click installation script
- **start.bat** - One-click start script

### 2. Created Linux/Mac Scripts  
- **install.sh** - Shell installation script
- **start.sh** - Shell start script

### 3. Fixed Cross-Platform Compatibility
- Removed hardcoded Linux socket path from `backend/server.js`
- Made MySQL connection work on both Windows and Linux
- Added platform detection for socket path

### 4. Added Database Tables
- **ADMINS** - Admin user management
- **INSTITUTIONS** - Community/institution tracking
- **COMMUNITY_REQUESTS** - Bulk donation requests
- **REQUEST_ITEMS** - Items in community requests
- Added default admin account (email: admin@example.com, password: admin123)

### 5. Created Configuration
- **.env.example** - Template for environment variables
- Database connection settings
- Port configuration

### 6. Added Documentation
- **README.md** - Complete installation guide
- **QUICKSTART_WINDOWS.md** - Quick start for Windows users

## How to Use on Windows

### Simple 2-Step Process:

1. **Install** (One time only)
   ```cmd
   install.bat
   ```
   - Checks Node.js installation
   - Installs dependencies
   - Creates configuration file
   - Sets up database (optional)

2. **Start** (Every time you want to use it)
   ```cmd
   start.bat
   ```
   - Starts the server
   - Opens on http://localhost:3000

That's it! No complex commands, no terminal confusion - just two simple scripts.

## What You Need Before Installing

1. **Node.js** - [Download from nodejs.org](https://nodejs.org/)
2. **MySQL** - [Download from MySQL.com](https://dev.mysql.com/downloads/installer/)

Both have simple Windows installers. Just download and click "Next" a few times!

## After Installation

### Access the System:
- **Admin Portal**: http://localhost:3000/frontend/ADMIN/
  - Login: admin@example.com / admin123

- **Donor Portal**: http://localhost:3000/frontend/donor-portal/

- **Recipient Portal**: http://localhost:3000/frontend/recipient-portal/

### Default Admin Account:
- Email: `admin@example.com`
- Password: `admin123`
- **Important**: Change the password after first login!

## Troubleshooting

### "Node.js not found"
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart Command Prompt after installation

### "MySQL connection failed"  
- Start MySQL from Windows Services
- Edit `.env` file with correct password
- Default MySQL user is usually `root` with blank password

### "Port 3000 already in use"
- Edit `.env` file
- Change `BACKEND_PORT=3000` to `BACKEND_PORT=3001`
- Restart using `start.bat`

## Project Structure

```
BDSM/
├── install.bat          ← Run this first
├── start.bat            ← Run this to start
├── .env                 ← Configuration (created by install.bat)
├── backend/
│   └── server.js        ← Backend API
├── frontend/
│   ├── ADMIN/           ← Admin interface
│   ├── donor-portal/    ← Donor interface  
│   └── recipient-portal/← Recipient interface
└── database.sql         ← Database schema
```

## Need Help?

1. Read `README.md` for detailed instructions
2. Check `QUICKSTART_WINDOWS.md` for Windows-specific tips
3. Make sure MySQL is running (Windows Services → MySQL)
4. Verify `.env` file has correct database credentials

## Summary

You now have a professional donation management system that:
- ✅ Installs with one command
- ✅ Starts with one command  
- ✅ Works on Windows (and Linux/Mac)
- ✅ Includes admin, donor, and recipient portals
- ✅ Tracks donations, requests, and distributions
- ✅ Has a default admin account ready to use

Just run `install.bat` once, then `start.bat` whenever you need it!
