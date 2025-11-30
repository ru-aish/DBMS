# BDSM - Basic Donation System Management

A web-based donation management system for tracking donations, recipients, and item distributions.

## Quick Start

### Windows Users

1. **Install Dependencies**
   ```cmd
   install.bat
   ```

2. **Start the Application**
   ```cmd
   start.bat
   ```

### Linux/Mac Users

1. **Install Dependencies**
   ```bash
   ./install.sh
   ```

2. **Start the Application**
   ```bash
   ./start.sh
   ```

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)

## Installation Steps

### 1. Install Node.js
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` and `npm --version`

### 2. Install MySQL
- **Windows**: Download MySQL Installer from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
- **Linux**: `sudo apt-get install mysql-server` (Ubuntu/Debian) or use XAMPP
- **Mac**: `brew install mysql` or use MAMP

### 3. Configure Database
1. Start MySQL service
2. Create database and tables by running:
   ```bash
   mysql -u root -p < database.sql
   ```
3. Edit `.env` file with your MySQL credentials:
   ```
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=donation_system
   BACKEND_PORT=3000
   ```

### 4. Run Installation Script
- **Windows**: Double-click `install.bat` or run in Command Prompt
- **Linux/Mac**: Run `./install.sh` in terminal

### 5. Start the Application
- **Windows**: Double-click `start.bat` or run in Command Prompt
- **Linux/Mac**: Run `./start.sh` in terminal

## Accessing the Application

Once started, the application will be available at:
- **Backend API**: http://localhost:3000
- **Admin Portal**: http://localhost:3000/frontend/ADMIN/
- **Donor Portal**: http://localhost:3000/frontend/donor-portal/
- **Recipient Portal**: http://localhost:3000/frontend/recipient-portal/

## Default Admin Login

After setting up the database, you'll need to create an admin account manually:

```sql
USE donation_system;
INSERT INTO ADMINS (full_name, email, password, role, status) 
VALUES ('Admin', 'admin@example.com', '$2b$10$rBV2u3h9AV9yAQ7dPXGnRe4v8LQm7QmM3nZ5F3jVvH5VZzJ1lP8pe', 'super_admin', 'active');
```

Default password: `admin123` (change after first login)

## Troubleshooting

### MySQL Connection Issues (Windows)
If you encounter MySQL connection errors:
1. Ensure MySQL service is running (Services → MySQL)
2. Check MySQL port (default: 3306)
3. Verify credentials in `.env` file

### MySQL Socket Issues (Linux)
If using XAMPP on Linux, add to `.env`:
```
MYSQL_SOCKET=/opt/lampp/var/mysql/mysql.sock
```

### Port Already in Use
If port 3000 is already in use, change `BACKEND_PORT` in `.env`:
```
BACKEND_PORT=3001
```

## Project Structure

```
BDSM/
├── backend/
│   └── server.js          # Backend API server
├── frontend/
│   ├── ADMIN/             # Admin portal
│   ├── donor-portal/      # Donor interface
│   └── recipient-portal/  # Recipient interface
├── database.sql           # Database schema
├── .env                   # Configuration (create from .env.example)
├── install.bat            # Windows installer
├── install.sh             # Linux/Mac installer
├── start.bat              # Windows start script
└── start.sh               # Linux/Mac start script
```

## Features

- **Donor Management**: Register donors and track donations
- **Recipient Management**: Manage recipients and verify eligibility
- **Item Tracking**: Track donated items and their distribution
- **Request System**: Recipients can request specific items
- **Admin Dashboard**: Overview of donations, distributions, and statistics
- **Distribution Tracking**: Track item distributions and recipient feedback

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify MySQL credentials in `.env` file
4. Check console logs for error messages

## License

This project is for educational purposes.
