# Word of Hope Caloocan Attendance System

A comprehensive web-based attendance management system for Word of Hope Caloocan church, featuring member registration, QR code generation, and real-time attendance tracking.

## Features

### 📋 Member Registration
- Complete member registration form with personal details
- Ministry assignment and categorization
- Automatic QR code generation for each member
- Mobile-responsive registration interface

### 🎫 Digital ID Cards
- Professional ID card generation with QR codes
- High-quality image download (PNG format)
- Sharp, printable output with proper text overflow handling
- Mobile-optimized card layout

### 📊 Attendance Management
- QR code scanner for quick check-ins
- Real-time attendance tracking
- Mobile-friendly scanner interface
- Attendance history and reports

### 🖥️ Dashboard & Analytics
- Comprehensive dashboard with statistics
- Member management interface
- Attendance reports and analytics
- Administrative controls

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Database**: SQL-based database system
- **QR Code**: QRCode.js library
- **Image Export**: dom-to-image library
- **Styling**: Custom CSS with responsive design

## Project Structure

```
├── assets/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript modules
│   └── libs/          # Third-party libraries
├── attendance/        # Attendance tracking pages
├── components/        # Reusable UI components
├── dashboard/         # Admin dashboard
├── database/          # SQL schema files
├── members/           # Member management
├── registration/      # Member registration & ID generation
├── reports/           # Reporting interface
├── server/            # Backend API and middleware
└── settings/          # System configuration
```

## Requirements

### System Requirements
- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher
- **MySQL**: Version 8.0 or higher
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

### Dependencies
- **bcryptjs**: ^2.4.3 - Password hashing
- **cors**: ^2.8.5 - Cross-origin resource sharing
- **dotenv**: ^16.6.1 - Environment variable management
- **express**: ^4.18.2 - Web framework
- **express-rate-limit**: ^8.3.2 - API rate limiting
- **helmet**: ^8.1.0 - Security middleware
- **jsonwebtoken**: ^9.0.3 - JWT authentication
- **mysql2**: ^3.6.5 - MySQL database driver

### Development Dependencies
- **nodemon**: ^3.0.2 - Development server with auto-restart

## Installation

1. **Prerequisites**: Ensure Node.js and MySQL are installed
2. Clone the repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up MySQL database using files in `/database/`
5. Configure environment variables in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=woh_attendance
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```
6. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Key Features Implementation

### Mobile-First Design
- Responsive layouts for all screen sizes
- Touch-friendly interfaces
- Optimized mobile forms and scanners

### QR Code System
- Unique QR codes for each member
- High-quality code generation
- Scanner integration for attendance

### Image Export
- Sharp, clear ID card downloads
- Proper text overflow handling
- Professional print-ready output

## Usage

### Sample Account
For testing and initial setup, use the default admin account:

- **Email**: `admin@wordofhope.org`
- **Password**: `Gospel_316`
- **Role**: Administrator

> **Note**: Change the default password immediately after first login for security purposes.

### Getting Started

1. **Login**: Navigate to the login page and use the sample account
2. **Registration**: Navigate to registration page to add new members
3. **ID Generation**: Automatic ID card creation with QR codes
4. **Attendance**: Use QR scanner for member check-ins
5. **Management**: Access dashboard for reports and member management

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a church management system for Word of Hope Caloocan. For modifications or improvements, please ensure all changes maintain the existing functionality and mobile responsiveness.