const express = require('express');
const promisePool = require('./db').promisePool;
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [[{ total_members }]] = await promisePool.query('SELECT COUNT(*) AS total_members FROM members');
    const [[{ total_attendance }]] = await promisePool.query('SELECT COUNT(*) AS total_attendance FROM attendance');
    return res.status(200).json({
      status: 'success',
      stats: { total_members, total_attendance }
    });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Failed to load stats' });
  }
});

module.exports = router;
