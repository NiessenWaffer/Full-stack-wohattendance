const express = require('express');
const promisePool = require('./db').promisePool;
const router = express.Router();

router.get('/attendance-by-date', async (req, res) => {
  const from = req.query.from && /^\d{4}-\d{2}-\d{2}$/.test(req.query.from) ? req.query.from : null;
  const to   = req.query.to   && /^\d{4}-\d{2}-\d{2}$/.test(req.query.to)   ? req.query.to   : null;
  if (!from || !to) return res.status(400).json({ status: 'error', message: 'from and to dates required (YYYY-MM-DD)' });
  try {
    const [rows] = await promisePool.query(
      `SELECT a.attendance_date, a.attendance_time, m.first_name, m.last_name, m.ministry
       FROM attendance a
       JOIN members m ON a.member_id = m.id
       WHERE a.attendance_date BETWEEN ? AND ?
       ORDER BY a.attendance_date DESC, a.attendance_time ASC`,
      [from, to]
    );
    return res.status(200).json({ status: 'success', records: rows });
  } catch { return res.status(500).json({ status: 'error', message: 'Failed to load report' }); }
});

router.get('/member-summary', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT m.id, m.first_name, m.last_name, m.ministry, m.registered_at,
              COUNT(a.id) AS total_attended,
              MAX(a.attendance_date) AS last_attended
       FROM members m
       LEFT JOIN attendance a ON a.member_id = m.id
       GROUP BY m.id
       ORDER BY total_attended DESC, m.first_name ASC`
    );
    return res.status(200).json({ status: 'success', members: rows });
  } catch { return res.status(500).json({ status: 'error', message: 'Failed to load report' }); }
});

router.get('/inactive', async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  try {
    const [rows] = await promisePool.query(
      `SELECT m.id, m.first_name, m.last_name, m.ministry, m.registered_at,
              MAX(a.attendance_date) AS last_attended,
              COUNT(a.id) AS total_attended
       FROM members m
       LEFT JOIN attendance a ON a.member_id = m.id
       GROUP BY m.id
       HAVING last_attended IS NULL OR last_attended < DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY last_attended ASC, m.first_name ASC`,
      [days]
    );
    return res.status(200).json({ status: 'success', members: rows });
  } catch { return res.status(500).json({ status: 'error', message: 'Failed to load report' }); }
});

module.exports = router;
