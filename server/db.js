const mysql = require('mysql2');
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'woh_attendance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('[DB] ❌ Database connection failed:', err.message);
    console.error('[DB] Check MySQL is running and credentials are correct');
    process.exit(1);
  }
  console.log('[DB] ✓ Database connected successfully');
  connection.release();
});

const promisePool = pool.promise();
module.exports = pool;
module.exports.promisePool = promisePool;
