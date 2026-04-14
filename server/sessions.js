const express = require('express');
const promisePool = require('./db').promisePool;
const router = express.Router();

router.get('/active', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT id, email, logged_in_at, last_active_at
       FROM sessions
       WHERE is_active = 1 AND role = 'worker'
       ORDER BY logged_in_at DESC`
    );
    return res.status(200).json({ status: 'success', workers: rows, count: rows.length });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Failed to load active sessions' });
  }
});

router.post('/ping', async (req, res) => {
  try {
    await promisePool.query(
      'UPDATE sessions SET last_active_at = NOW() WHERE user_id = ? AND is_active = 1',
      [req.admin.id]
    );
    return res.status(200).json({ status: 'success' });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Ping failed' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await promisePool.query(
      'UPDATE sessions SET is_active = 0 WHERE user_id = ? AND is_active = 1',
      [req.admin.id]
    );
    return res.status(200).json({ status: 'success' });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Logout failed' });
  }
});

module.exports = router;
