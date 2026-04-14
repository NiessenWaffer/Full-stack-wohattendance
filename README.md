# Word of Hope Caloocan Attendance System

A comprehensive web-based attendance management system for Word of Hope Caloocan church, featuring member registration, QR code generation, real-time attendance tracking, and administrative dashboard.

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- QRCode.js - QR code generation
- Html5Qrcode - QR code scanning
- dom-to-image - ID card export to PNG
- Google Fonts (Inter typeface)
- Mobile-first responsive design

### Backend
- Node.js with Express.js
- MySQL 8.0+ with mysql2 driver
- JWT authentication with bcryptjs password hashing
- Helmet.js security headers
- CORS and rate limiting

### Database
- MySQL 8.0+
- Connection pooling (10 connections max)
- Foreign key constraints
- Enum types for status/roles

## Project Structure

```
├── assets/
│   ├── css/                    # Responsive stylesheets
│   │   ├── attendance.css      # QR scanner and attendance UI
│   │   ├── dashboard.css       # Dashboard analytics styles
│   │   ├── registration.css    # Member registration forms
│   │   ├── settings.css        # Settings page styles
│   │   └── sidebar.css         # Navigation sidebar
│   ├── js/                     # JavaScript modules
│   │   ├── app-init.js         # App initialization and layout loading
│   │   ├── attendance.js       # QR scanner and attendance UI
│   │   ├── auth.js             # Centralized authentication module
│   │   ├── layout-loader.js    # Dynamic layout loading
│   │   ├── loader.js           # Loading screen management
│   │   ├── login.js            # Login form handling
│   │   ├── offlineQueue.js     # Offline queue storage
│   │   ├── registration.js     # Member registration form
│   │   ├── sanitize.js         # Input sanitization
│   │   └── syncManager.js      # Offline sync management
│   └── libs/
│       └── qrcode.min.js       # QR code generation library
├── attendance/
│   └── attendance.html         # QR scanner and attendance tracking
├── components/
│   └── sidebar.html            # Reusable navigation sidebar
├── dashboard/
│   └── dashboard.html          # Main admin dashboard with analytics
├── database/                   # SQL schema files (run in order)
│   ├── 01_database.sql         # Database creation
│   ├── 02_admins.sql           # Admin/worker accounts table
│   ├── 03_members.sql          # Member profiles with QR codes
│   ├── 04_attendance.sql       # Attendance records and events
│   ├── 05_sessions.sql         # User session tracking
│   └── 06_workers.sql          # Worker role management
├── events/
│   └── events.html             # Event management
├── members/
│   └── members.html            # Member management interface
├── registration/
│   ├── qr-generate.html        # ID card generation with QR code
│   └── registration.html       # Member registration form
├── reports/
│   └── reports.html            # Attendance reports
├── server/                     # Backend API and middleware
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── attendance.js           # QR scan and attendance marking
│   ├── auth.js                 # Login endpoint with JWT token generation
│   ├── dashboard.js            # Dashboard analytics endpoints
│   ├── db.js                   # MySQL connection pool configuration
│   ├── events.js               # Event management
│   ├── index.js                # Express app setup with all route mounting
│   ├── limits.js               # Rate limiting configuration
│   ├── members.js              # Member CRUD operations
│   ├── notifications.js        # Activity notifications
│   ├── register.js             # Member registration endpoint
│   ├── reports.js              # Report generation
│   ├── sessions.js             # Session tracking
│   ├── stats.js                # System statistics
│   └── workers.js              # Worker/staff account management
├── settings/
│   └── settings.html           # System settings
├── login.html                  # Admin authentication portal
└── WOHLOGO.png                 # Church logo
```

## Features

### Login
- JWT-based authentication with 8-hour token expiration
- Bcrypt password hashing (10 salt rounds)
- Rate limiting: 5 login attempts per 15 minutes
- Session tracking with automatic logout
- Role-based access control (admin vs worker)

### Registration
- Member registration with first/last name and ministry selection
- Automatic unique QR code generation (WOH-{timestamp}-{random})
- 7 ministry categories: Multimedia, Praise and Worship, Medical, Children, Young Professional, Pastor, Youth Alive
- Mobile-responsive registration interface
- Duplicate name prevention

### QR Code ID Card
- Professional ID card generation with QR codes
- High-quality PNG image download with dom-to-image library
- Sharp, printable output with proper text overflow handling
- Mobile-optimized card layout
- Automatic QR code generation for each member

### Attendance
- QR code scanning with Html5Qrcode library
- Manual member search and mark attendance
- Duplicate attendance prevention (one per day per member)
- Automatic time recording and member status promotion
- Today's attendance display with real-time updates
- Offline queue support with automatic sync
- Mobile-friendly scanner interface

### Members
- Member status: visitor → active (auto-promoted after 3 attendances)
- First attendance date tracking
- Member search by name, ministry, and status
- Edit member details (name, ministry, status)
- Delete member with attendance record validation
- Member summary with attendance count and last attended

### Dashboard
- Total members count and today's attendance
- Attendance rate percentage and last Sunday attendance
- Ministry breakdown by attendance
- Calendar view with attendance indicators
- Attendance by date selection
- 6-month Sunday attendance trend chart
- Active workers panel (admin only)
- Real-time notifications feed

### Settings
- Worker account management (admin only)
- Create worker accounts with email and password
- List and delete worker accounts
- Worker session tracking and active status

### Worker Accounts
- Two-tier role system: admin and worker
- Admin: Full system access, worker management
- Worker: Limited to attendance scanning and member registration
- Session tracking for active worker display
- Role-based route protection

### Notifications
- Real-time activity feed with attendance and registration notifications
- Worker login notifications
- Formatted timestamps (Today, Yesterday, specific dates)
- Unread count badge with mark as read functionality

### Session Management
- JWT token verification on all protected routes
- Session tracking with last_active_at timestamps
- Automatic session cleanup on logout
- Concurrent session prevention
- 401 error handling with automatic redirect

## Database Setup

### Prerequisites
- MySQL 8.0 or higher
- MySQL Workbench (recommended)

### Installation Steps

1. **Create Database and User**
   ```sql
   -- Connect to MySQL as root
   mysql -u root -p
   
   -- Create database
   CREATE DATABASE woh_attendance;
   
   -- Create user (optional)
   CREATE USER 'woh_user'@'localhost' IDENTIFIED BY 'Youth2025';
   GRANT ALL PRIVILEGES ON woh_attendance.* TO 'woh_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Run SQL Files in Order**
   ```bash
   mysql -u root -p woh_attendance < database/01_database.sql
   mysql -u root -p woh_attendance < database/02_admins.sql
   mysql -u root -p woh_attendance < database/03_members.sql
   mysql -u root -p woh_attendance < database/04_attendance.sql
   mysql -u root -p woh_attendance < database/05_sessions.sql
   mysql -u root -p woh_attendance < database/06_workers.sql
   ```

## Installation and Setup

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- MySQL Workbench

### Steps

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd woh-attendance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup the database**
   - Follow the Database Setup section above

4. **Configure environment variables**
   Create `.env` file in project root:
   ```env
   JWT_SECRET=woh_attendance_super_secret_2026
   DB_PASSWORD=Youth2025
   DB_HOST=localhost
   DB_USER=root
   DB_NAME=woh_attendance
   PORT=3000
   ```

5. **Run the server**
   ```bash
   # Production
   npm start
   
   # Development with auto-restart
   npm run dev
   ```

6. **Open the app**
   Navigate to: http://localhost:3000/login.html

## Default Login Credentials

**Email:** admin@wordofhope.org  
**Password:** Create your own password and hash it 

**Note:** Change the default password immediately after first login for security purposes.

## API Routes

### Auth
- `POST /api/auth/login` - Login with email/password, returns JWT token

### Members
- `GET /api/members` - List all members with filters (search, ministry, status)
- `PUT /api/members/:id` - Update member details
- `DELETE /api/members/:id` - Delete member

### Registration
- `POST /api/register` - Register new member (rate limited: 10/hour)

### Attendance
- `GET /api/attendance/today` - Today's attendance records
- `POST /api/attendance/mark` - Manual attendance marking
- `POST /api/attendance/scan` - Scan QR code (rate limited: 30/minute)
- `GET /api/attendance/members/search` - Search members by name

### Workers
- `GET /api/workers` - List workers (admin only)
- `POST /api/workers/create` - Create worker account (admin only)
- `DELETE /api/workers/:id` - Delete worker (admin only)

### Sessions
- `GET /api/sessions/active` - List active worker sessions
- `POST /api/sessions/ping` - Update last_active_at timestamp
- `POST /api/sessions/logout` - Mark session as inactive

### Notifications
- `GET /api/notifications` - Get recent activity notifications

### Stats
- `GET /api/stats` - Total members and attendance count

## Role System

### Admin
- Full access to everything
- Can create/delete worker accounts
- Can view active worker sessions
- Can manage all members, events, reports
- Can access all dashboard features

### Worker
- Can mark attendance and scan QR codes
- Can register members
- Can view today's attendance
- Cannot delete members
- Cannot manage workers
- Cannot access settings

## Security Features

- bcrypt password hashing (10 salt rounds)
- helmet security headers
- CORS restrictions to localhost
- Rate limiting on login, registration, and scanning
- JWT token authentication with 8-hour expiration
- Role-based access control
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- Session tracking to prevent concurrent logins
- 401 auto-redirect to login on token expiration

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari (iOS camera support for QR scanning)

## Known Limitations

- Currently localhost only
- No email notifications
- No SMS features
- Single church instance only

## Build Roadmap

### Phase 2: Navigation and Security
- Enhanced security features
- Multi-factor authentication
- Password reset functionality

### Phase 3: Member Management
- Member photo uploads
- Advanced member profiles
- Member communication features

### Phase 4: Event Management
- Event attendance tracking
- Event registration system
- Event notifications

### Phase 5: Reports and Dashboard
- Advanced reporting features
- Data export capabilities
- Analytics dashboard enhancements

## Developer Notes

- **MySQL Credentials:** Configure in `.env` file or use defaults (root/Youth2025)
- **Node.js Version:** Requires v18+ for optimal performance
- **Server Port:** Default 3000, configurable via PORT environment variable
- **Database Connection:** Configured in `server/db.js` with connection pooling
- **Authentication:** JWT tokens stored in localStorage, 8-hour expiration
- **API Base URL:** http://localhost:3000 for all frontend requests
- **Rate Limiting:** Login (5/15min), Registration (10/hour), Scan (30/minute)
- **Session Management:** Automatic cleanup on logout, concurrent session prevention