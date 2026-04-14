const express = require('express');
const promisePool = require('./db').promisePool;
const router = express.Router();

router.get('/summary', async (req, res) => {
  console.log('[DASHBOARD] /summary - Request received');
  try {
    const [[{ total }]] = await promisePool.query('SELECT COUNT(*) as total FROM members');
    const [[{ today }]] = await promisePool.query(
      'SELECT COUNT(*) as today FROM attendance WHERE attendance_date = CURDATE()'
    );
    const rate = total > 0 ? Math.round((today / total) * 1000) / 10 : 0;
    const [ministryRows] = await promisePool.query(
      `SELECT m.ministry, COUNT(*) as count
       FROM attendance a
       JOIN members m ON a.member_id = m.id
       WHERE a.attendance_date = CURDATE()
       GROUP BY m.ministry
       ORDER BY count DESC
       LIMIT 1`
    );
    const top_ministry = ministryRows.length > 0 ? ministryRows[0].ministry : '—';
    return res.status(200).json({
      status: 'success',
      total_members: total,
      today_attendance: today,
      attendance_rate: rate,
      top_ministry
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to load summary' });
  }
});

router.get('/today', async (req, res) => {
  console.log('[DASHBOARD] /today - Request received');
  try {
    const [rows] = await promisePool.query(
      `SELECT a.attendance_time, m.first_name, m.last_name, m.ministry
       FROM attendance a
       JOIN members m ON a.member_id = m.id
       WHERE a.attendance_date = CURDATE()
       ORDER BY a.created_at DESC`
    );
    return res.status(200).json({ status: 'success', attendance: rows });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to load today attendance' });
  }
});

router.get('/calendar', async (req, res) => {
  console.log('[DASHBOARD] /calendar - Request received');
  const month = req.query.month && typeof req.query.month === 'string'
    ? req.query.month.trim()
    : null;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ status: 'error', message: 'month parameter required (YYYY-MM)' });
  }
  try {
    const [rows] = await promisePool.query(
      `SELECT attendance_date, COUNT(*) as count
       FROM attendance
       WHERE DATE_FORMAT(attendance_date, '%Y-%m') = ?
       GROUP BY attendance_date`,
      [month]
    );
    return res.status(200).json({ status: 'success', dates: rows });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to load calendar data' });
  }
});

router.get('/attendance-by-date', async (req, res) => {
  const date = req.query.date && typeof req.query.date === 'string'
    ? req.query.date.trim()
    : null;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ status: 'error', message: 'date parameter required (YYYY-MM-DD)' });
  }
  try {
    const [rows] = await promisePool.query(
      `SELECT m.first_name, m.last_name, m.ministry, a.attendance_time
       FROM attendance a
       JOIN members m ON a.member_id = m.id
       WHERE a.attendance_date = ?
       ORDER BY a.attendance_time ASC`,
      [date]
    );
    return res.status(200).json({ status: 'success', attendance: rows });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to load attendance' });
  }
});

router.get('/weekly', async (req, res) => {
  console.log('[DASHBOARD] /weekly - Request received');
  try {
    const [[{ weekly }]] = await promisePool.query(
      `SELECT COUNT(*) as weekly FROM attendance
       WHERE attendance_date = (
         SELECT MAX(attendance_date) FROM attendance
         WHERE DAYOFWEEK(attendance_date) = 1
       )`
    );
    const [ministryRows] = await promisePool.query(
      `SELECT m.ministry, COUNT(*) as count
       FROM attendance a
       JOIN members m ON a.member_id = m.id
       WHERE a.attendance_date = (
         SELECT MAX(attendance_date) FROM attendance
         WHERE DAYOFWEEK(attendance_date) = 1
       )
       GROUP BY m.ministry
       ORDER BY count DESC`
    );
    return res.status(200).json({ status: 'success', weekly_attendance: weekly, ministries: ministryRows });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to load last Sunday data' });
  }
});

router.get('/chart', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT
         DATE_FORMAT(attendance_date, '%Y-%m') as month_key,
         DATE_FORMAT(attendance_date, '%b') as month_label,
         WEEK(attendance_date, 1) - WEEK(DATE_SUB(attendance_date, INTERVAL DAYOFMONTH(attendance_date)-1 DAY), 1) + 1 as sunday_num,
         COUNT(*) as attendance
       FROM attendance
       WHERE DAYOFWEEK(attendance_date) = 1
         AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY month_key, month_label, sunday_num
       ORDER BY month_key ASC, sunday_num ASC`
    );
    const monthMap = {};
    rows.forEach(r => {
      if (!monthMap[r.month_key]) {
        monthMap[r.month_key] = { month: r.month_label, sundays: [] };
      }
      monthMap[r.month_key].sundays.push({
        label: `S${r.sunday_num}`,
        attendance: r.attendance
      });
    });
    return res.status(200).json({ status: 'success', months: Object.values(monthMap) });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to load chart data' });
  }
});

module.exports = router;
