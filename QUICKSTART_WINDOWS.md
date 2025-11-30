# QUICK START GUIDE - Windows

## Two Simple Steps to Get Started!

### Step 1: Install
Double-click `install.bat` or run in Command Prompt:
```cmd
install.bat
```

**What it does:**
- Checks if Node.js is installed
- Creates `.env` configuration file
- Installs all required dependencies
- Optionally sets up the database

**Prerequisites:**
- Node.js installed ([Download](https://nodejs.org/))
- MySQL installed and running ([Download](https://dev.mysql.com/downloads/installer/))

### Step 2: Start
Double-click `start.bat` or run in Command Prompt:
```cmd
start.bat
```

**What it does:**
- Starts the backend server
- Makes the application available at http://localhost:3000

## Access the Application

After starting, open your web browser and go to:

- **Admin Portal**: http://localhost:3000/frontend/ADMIN/index.html
  - Email: `admin@example.com`
  - Password: `admin123`

- **Donor Portal**: http://localhost:3000/frontend/donor-portal/index.html
  - Register as a new donor or login

- **Recipient Portal**: http://localhost:3000/frontend/recipient-portal/index.html
  - Register as a recipient or login

## Troubleshooting

### MySQL Connection Error
1. Make sure MySQL is running (check Windows Services)
2. Edit `.env` file with correct MySQL credentials
3. Test connection: `mysql -u root -p`

### Port 3000 Already in Use
Edit `.env` and change:
```
BACKEND_PORT=3001
```

### Dependencies Not Installing
1. Close any antivirus temporarily
2. Run Command Prompt as Administrator
3. Try: `npm cache clean --force` then `install.bat` again

## Configuration

Edit `.env` file to customize:
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=donation_system
BACKEND_PORT=3000
```

## That's It!

You now have a fully functional donation management system running on your Windows machine with just two scripts!

For more details, see README.md
