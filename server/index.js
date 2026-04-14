require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRouter = require('./auth');
const registerRouter = require('./register');
const attendanceRouter = require('./attendance');
const requireAuth = require('./middleware/auth');
const dashboardRouter = require('./dashboard');
const membersRouter  = require('./members');
const eventsRouter   = require('./events');
const reportsRouter  = require('./reports');
const workersRouter  = require('./workers');
const statsRouter    = require('./stats');
const sessionsRouter = require('./sessions');
const notificationsRouter = require('./notifications');
const app = express();
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    }
  })
);
app.use(express.json({ limit: '12kb' }));
app.use(express.static(require('path').join(__dirname, '..')));
app.use('/api/auth', authRouter);
app.use('/api', registerRouter);
app.use('/api/attendance', requireAuth, attendanceRouter);
app.use('/api/dashboard',  requireAuth, dashboardRouter);
app.use('/api/members',    requireAuth, membersRouter);
app.use('/api/events',     requireAuth, eventsRouter);
app.use('/api/reports',    requireAuth, reportsRouter);
app.use('/api/workers',   requireAuth, workersRouter);
app.use('/api/stats',     requireAuth, statsRouter);
app.use('/api/sessions',       requireAuth, sessionsRouter);
app.use('/api/notifications',  requireAuth, notificationsRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Database: ${process.env.DB_NAME || 'woh_attendance'}`);
  console.log(`✓ Ready to accept requests`);
});
