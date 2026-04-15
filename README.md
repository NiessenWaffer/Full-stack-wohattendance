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
- Rate limiting: 10 login attempts per 15 minutes
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
- **Offline queue support** - Attendance can be marked offline and synced when connection returns
- **Automatic sync management** - Queued attendance records sync automatically
- Mobile-friendly scanner interface with camera access

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

### Events
- Create, edit, and delete events
- Event types: Sunday Service, Youth Night, Prayer Meeting, Outreach, Special
- Event date and notes tracking
- Filter by upcoming/past events
- Event calendar integration with dashboard

### Reports
- Attendance reports by date range
- Member summary with attendance counts and last attended dates
- Inactive members report (members with 30+ days since last attendance)
- KPI dashboard: today's attendance, weekly totals, attendance rates
- Sunday attendance trend chart (last 4 Sundays)
- Recent registrations tracking
- CSV export functionality for all reports

### Settings
- Church profile management and system configuration
- Account security: email and password updates
- Worker account management (admin only)
- Attendance rules and system preferences
- Active session monitoring and management
- System information display

### Session Management
- JWT token verification on all protected routes
- Session tracking with last_active_at timestamps
- Automatic session cleanup on logout
- Concurrent session prevention
- 401 error handling with automatic redirect

## Security

This system implements multiple layers of security to protect against common web application vulnerabilities and unauthorized access.

### Authentication Security

The system uses JSON Web Tokens (JWT) for authentication, which is a secure and widely-adopted standard. When you log in, the server creates a token that expires after 8 hours. This token must be included with every request to protected areas of the system.

Passwords are protected using bcrypt hashing with 10 salt rounds. This means even if someone gains access to the database, they cannot see actual passwords. Bcrypt is specifically designed to be slow, making it extremely difficult for attackers to crack passwords even with powerful computers.

### Brute Force Protection

Login attempts are limited to 10 tries per 15 minutes per IP address. After reaching this limit, the system blocks further login attempts from that location. This prevents attackers from trying thousands of password combinations.

### SQL Injection Prevention

All database queries use parameterized statements. This means user input is never directly inserted into SQL commands. Instead, the database treats all user input as data, not as executable code. This completely prevents SQL injection attacks, which are one of the most common ways attackers compromise databases.

### Cross-Site Scripting (XSS) Prevention

User-provided data like member names and event details are properly sanitized before being displayed on web pages. The system uses safe DOM manipulation methods instead of directly inserting HTML, which prevents malicious scripts from being executed in users' browsers.

### Network Security

CORS (Cross-Origin Resource Sharing) is configured to only allow requests from localhost during development. This prevents other websites from making unauthorized requests to the system. For production deployment, this should be updated to only allow requests from the actual domain where the system is hosted.

### Data Protection

Sensitive information like JWT tokens are stored securely in the browser's local storage with proper validation. The system automatically clears authentication data when users log out or when tokens expire.

Database connections use connection pooling with a maximum of 10 concurrent connections, preventing resource exhaustion attacks. All database credentials are stored in environment variables, not in the source code.

### Server Security

The system uses Helmet.js middleware which automatically sets various HTTP security headers. These headers help protect against common attacks like clickjacking and MIME type sniffing. The server also limits request body sizes to prevent memory exhaustion attacks.

### Role-Based Access Control

The system has two user roles: admin and worker. Admins have full access to all features including user management and system settings. Workers can only scan attendance and register new members. This principle of least privilege ensures users only have access to features they actually need.

### Session Management

User sessions are tracked in the database with timestamps showing when users logged in and when they were last active. The system automatically logs out inactive users and prevents multiple concurrent sessions from the same account.

### Why This System Is Secure

The combination of these security measures makes the system resistant to common attack methods. Passwords cannot be easily cracked due to bcrypt hashing. Database attacks are prevented by parameterized queries. Brute force attacks are blocked by rate limiting. User input is properly sanitized to prevent script injection.

The system follows security best practices including input validation, output encoding, secure session management, and proper error handling. Regular security updates to dependencies help protect against newly discovered vulnerabilities.

However, like any system, security depends on proper deployment and maintenance. Strong passwords should be used, the system should be kept updated, and access should be monitored regularly.

### Changing JWT Secret

**IMPORTANT:** If you need to change the JWT_SECRET, here's what you need to know:

#### What happens when you change JWT_SECRET:
- **All existing user sessions will be invalidated immediately**
- **All users will be logged out and need to log in again**
- **Any stored tokens in browsers will become invalid**

#### Files that use JWT_SECRET:
1. **`.env`** - This is where you change the secret
2. **`server/auth.js`** - Uses JWT_SECRET to sign new tokens when users log in
3. **`server/middleware/auth.js`** - Uses JWT_SECRET to verify tokens on protected routes

#### Steps to safely change JWT_SECRET:

1. **Plan the change during low usage time** (users will be logged out)

2. **Update the .env file:**
   ```env
   JWT_SECRET=your_new_secure_secret_here
   ```

3. **Generate a strong secret** (recommended 64+ characters with mixed case, numbers, symbols):
   ```bash
   # You can generate one using Node.js:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Restart the server** - The server must be restarted to load the new secret

5. **Inform users** - All users will need to log in again

#### What you DON'T need to change:
- **Database** - No database changes needed
- **Frontend code** - No code changes needed
- **User passwords** - Passwords remain the same
- **Member data** - All member data stays intact

#### Security recommendations for JWT_SECRET:
- **Minimum 32 characters** (current one is 80 characters)
- **Use random characters** - letters, numbers, symbols
- **Never share or commit to version control**
- **Change periodically** for maximum security
- **Keep it secret** - only system administrators should know it

#### Example of a strong JWT_SECRET:
```env
JWT_SECRET=Kj9$mN2#pQ8*vR5&wX1!zA4@bC7%dE0^fG3+hI6-jK9~lM2<nO5>pQ8
```

The system will automatically handle token verification with the new secret once restarted.

### Changing Database Connection Settings

**IMPORTANT:** If you need to change database connection settings, here's what you need to know:

#### Database Environment Variables:
The system uses these environment variables for database connection:

1. **`DB_HOST`** - Database server address (default: `localhost`)
2. **`DB_USER`** - Database username (default: `root`)
3. **`DB_PASSWORD`** - Database password (default: empty)
4. **`DB_NAME`** - Database name (default: `woh_attendance`)

#### Files that use database settings:
1. **`.env`** - This is where you change the connection settings
2. **`server/db.js`** - Creates the MySQL connection pool using these variables
3. **`server/index.js`** - Displays the database name on server startup

#### What happens when you change database settings:
- **Server must be restarted** to use new connection settings
- **All active connections will be closed** and reconnected to new database
- **If database is different, all data will be different** (members, attendance, etc.)
- **If credentials are wrong, server will fail to start**

#### Steps to safely change database connection:

1. **Ensure the target database exists and is accessible**

2. **Update the .env file with new settings:**
   ```env
   DB_HOST=your_database_server_ip_or_hostname
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   ```

3. **Test the connection first** (optional but recommended):
   ```bash
   mysql -h your_database_server -u your_username -p your_database_name
   ```

4. **If moving to a new database, run the schema files:**
   ```bash
   mysql -h your_database_server -u your_username -p your_database_name < database/01_database.sql
   mysql -h your_database_server -u your_username -p your_database_name < database/02_admins.sql
   mysql -h your_database_server -u your_username -p your_database_name < database/03_members.sql
   mysql -h your_database_server -u your_username -p your_database_name < database/04_attendance.sql
   mysql -h your_database_server -u your_username -p your_database_name < database/05_sessions.sql
   mysql -h your_database_server -u your_username -p your_database_name < database/06_workers.sql
   ```

5. **Restart the server** - The server must be restarted to use new connection settings

6. **Check server startup logs** - Verify connection is successful:
   ```
   ✓ Database connected successfully
   ✓ Database: your_database_name
   ```

#### Common scenarios:

**Moving to a different server:**
```env
DB_HOST=192.168.1.100  # or database.yourcompany.com
DB_USER=woh_user
DB_PASSWORD=secure_password
DB_NAME=woh_attendance
```

**Using a different database name:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Youth2025
DB_NAME=church_attendance_system
```

**Connecting to cloud database (e.g., AWS RDS):**
```env
DB_HOST=your-rds-instance.region.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your_secure_password
DB_NAME=woh_attendance
```

#### What you DON'T need to change:
- **Application code** - No code changes needed
- **Frontend files** - Database connection is backend only
- **JWT_SECRET** - Authentication is independent of database location

#### Troubleshooting database connection issues:

**Server won't start:**
- Check if database server is running
- Verify credentials are correct
- Ensure database name exists
- Check firewall settings if connecting to remote server

**Connection timeout:**
- Verify DB_HOST is correct
- Check network connectivity
- Ensure database server accepts connections from your IP

**Access denied:**
- Verify DB_USER and DB_PASSWORD are correct
- Check if user has permissions on the database
- Ensure user can connect from your server's IP address

#### Security considerations:
- **Use strong database passwords**
- **Create dedicated database user** instead of using root
- **Grant only necessary permissions** to the database user
- **Use SSL connections** for remote databases when possible
- **Keep DB_PASSWORD secret** - never commit to version control

#### Example of secure database user setup:
```sql
-- Create dedicated user for the application
CREATE USER 'woh_app'@'localhost' IDENTIFIED BY 'very_secure_password_here';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON woh_attendance.* TO 'woh_app'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
```

Then use in .env:
```env
DB_USER=woh_app
DB_PASSWORD=very_secure_password_here
```

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
- MySQL Workbench (recommended)

### Dependencies
**Production:**
- express: Web framework
- mysql2: MySQL database driver
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- helmet: Security headers
- cors: Cross-origin resource sharing
- express-rate-limit: Rate limiting
- dotenv: Environment variables

**Development:**
- nodemon: Auto-restart server during development

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
   JWT_SECRET=your_secure_jwt_secret_here
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

   **Available Scripts:**
   - `npm start` - Run the server in production mode
   - `npm run dev` - Run the server in development mode with auto-restart (requires nodemon)

6. **Open the app**
   Navigate to: http://localhost:3000/login.html

## Default Login Credentials

**Email:** admin@wordofhope.org  
**Password:** admin123  

**Note:** Change the default password immediately after first login for security purposes.

### Changing Admin Account Credentials

**IMPORTANT:** For security, you should change the default admin credentials immediately after installation.

#### Method 1: Change Password Through Settings (Recommended)

1. **Log in with default credentials**
   - Email: admin@wordofhope.org
   - Password: admin123

2. **Navigate to Settings page**
   - Click on "Settings" in the sidebar
   - Look for "Change Password" section

3. **Update your password**
   - Enter current password (admin123)
   - Enter new secure password
   - Confirm new password
   - Click "Update Password"

#### Method 2: Change Credentials Directly in Database

**WARNING:** Only use this method if you cannot access the system or forgot your password.

1. **Generate new password hash**
   ```bash
   # Using Node.js to generate bcrypt hash
   node -e "console.log(require('bcryptjs').hashSync('your_new_password', 10))"
   ```

2. **Update database directly**
   ```sql
   -- Connect to MySQL
   mysql -u root -p woh_attendance
   
   -- Update admin email and password
   UPDATE admins 
   SET email = 'your_new_email@domain.com', 
       password = '$2a$10$your_generated_hash_here'
   WHERE email = 'admin@wordofhope.org';
   ```

3. **Verify the change**
   ```sql
   -- Check if update was successful
   SELECT email, display_name, role FROM admins WHERE role = 'admin';
   ```

#### Method 3: Create New Admin and Delete Default

1. **Create new admin account through Settings**
   - Log in as default admin
   - Go to Settings → Worker Management
   - Create new worker account with admin role
   - Use your preferred email and secure password

2. **Test new admin account**
   - Log out from default admin
   - Log in with new admin credentials
   - Verify all features work correctly

3. **Delete default admin account**
   ```sql
   -- Connect to database
   mysql -u root -p woh_attendance
   
   -- Delete default admin (only after confirming new admin works)
   DELETE FROM admins WHERE email = 'admin@wordofhope.org';
   ```

#### Security Recommendations for Admin Account:

**Strong Password Requirements:**
- **Minimum 12 characters**
- **Mix of uppercase and lowercase letters**
- **Include numbers and special characters**
- **Avoid common words or personal information**
- **Don't reuse passwords from other systems**

**Email Address:**
- **Use your actual email address** for password reset functionality
- **Use organization domain** (e.g., admin@yourchurch.org)
- **Avoid generic addresses** like admin@gmail.com

**Account Security:**
- **Change password regularly** (every 90 days recommended)
- **Don't share admin credentials** with multiple people
- **Create separate worker accounts** for staff members
- **Log out when finished** using the system
- **Monitor login activity** through session tracking

#### What happens when you change admin credentials:

**Password Change:**
- **Current session remains active** until logout
- **Other devices will need to log in again** with new password
- **All functionality remains the same**
- **No database structure changes needed**

**Email Change:**
- **Must use new email for future logins**
- **Update any documentation** with new admin email
- **Inform other administrators** of the change

#### Files affected by admin account changes:

1. **Database table: `admins`** - Stores the actual credentials
2. **No code files need changes** - System reads from database
3. **Update documentation** if you change default credentials permanently

#### Troubleshooting admin account issues:

**Forgot admin password:**
- Use Method 2 above to reset via database
- Or restore from database backup if available

**Cannot access Settings page:**
- Check if you're logged in as admin (not worker)
- Workers cannot access Settings page

**Password hash generation fails:**
- Ensure Node.js is installed
- Ensure bcryptjs package is available: `npm install bcryptjs`
- Use online bcrypt generator as alternative (less secure)

**Database update fails:**
- Verify you're connected to correct database
- Check if admins table exists: `SHOW TABLES;`
- Verify admin record exists: `SELECT * FROM admins;`

#### Example of secure admin setup:
```sql
-- Example of updating to secure admin credentials
UPDATE admins 
SET email = 'pastor@wordofhopecaloocan.org', 
    password = '$2a$10$newSecureHashGeneratedWithBcrypt',
    display_name = 'Pastor John'
WHERE email = 'admin@wordofhope.org';
```

**Remember:** Always test the new credentials before deleting the old admin account to avoid being locked out of the system.

## API Routes

### Auth
- `POST /api/auth/login` - Login with email/password, returns JWT token

### Members
- `GET /api/members` - List all members with filters (search, ministry, status)
- `PUT /api/members/:id` - Update member details
- `DELETE /api/members/:id` - Delete member

### Registration
- `POST /api/register` - Register new member

### Attendance
- `GET /api/attendance/today` - Today's attendance records
- `POST /api/attendance/mark` - Manual attendance marking
- `POST /api/attendance/scan` - Scan QR code
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

### Events
- `GET /api/events` - List all events with optional filters (upcoming/past)
- `POST /api/events` - Create new event (admin only)
- `PUT /api/events/:id` - Update event details (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Reports
- `GET /api/reports/attendance-by-date` - Attendance report by date range
- `GET /api/reports/member-summary` - Member summary with attendance statistics
- `GET /api/reports/inactive` - List of inactive members (30+ days)

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

## Browser Support

- **Chrome (recommended)** - Full feature support including camera access for QR scanning
- **Firefox** - Full feature support with camera permissions
- **Edge** - Full feature support on Windows devices
- **Safari** - iOS camera support for QR scanning, full desktop functionality

**Mobile Support:**
- Responsive design with mobile-first approach
- Touch-friendly interface optimized for smartphones and tablets
- Camera access for QR code scanning on mobile devices
- Offline functionality with automatic sync when connection returns

## Known Limitations

- **Network Configuration:** Currently configured for localhost only (production deployment requires CORS and environment updates)
- **Notification System:** No email or SMS notifications (browser notifications only)
- **Multi-Church Support:** Designed for single church instance (no multi-tenant architecture)
- **Data Export:** Limited to CSV export (no PDF or Excel export)
- **Backup System:** No automated database backup (manual MySQL backup required)

## Build Roadmap

### ✅ Phase 1: Core System (COMPLETED)
- Authentication and security
- Member registration and management
- QR code generation and scanning
- Attendance tracking
- Dashboard analytics
- Worker management
- Events management
- Reports system

### 🚧 Phase 2: Enhanced Features (PLANNED)
- Multi-factor authentication
- Password reset functionality
- Email notification system
- Advanced member profiles with photos

### 📋 Phase 3: Communication Features (PLANNED)
- SMS notifications for events
- Email reminders for inactive members
- Automated attendance reports
- Member communication portal

### 🌐 Phase 4: Production Deployment (PLANNED)
- Production environment configuration
- Cloud database integration
- SSL certificate setup
- Domain configuration and hosting

### 📊 Phase 5: Advanced Analytics (PLANNED)
- Advanced reporting dashboard
- Data visualization improvements
- Export to PDF and Excel
- Automated backup system

## Developer Notes

- **MySQL Credentials:** Configure in `.env` file or use defaults (root/Youth2025)
- **Node.js Version:** Requires v18+ for optimal performance
- **Server Port:** Default 3000, configurable via PORT environment variable
- **Database Connection:** Configured in `server/db.js` with connection pooling
- **Authentication:** JWT tokens stored in localStorage, 8-hour expiration
- **API Base URL:** http://localhost:3000 for all frontend requests
- **Rate Limiting:** Login (10/15min) - Registration and QR scanning have no limits per user request
- **Session Management:** Automatic cleanup on logout, concurrent session prevention