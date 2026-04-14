const express = require('express');
const promisePool = require('./db').promisePool;
const router = express.Router();

const ALLOWED_MINISTRIES = new Set([
  'Multimedia', 'Praise and Worship', 'Medical', 'Children',
  'Young Professional', 'Pastor', 'Youth Alive'
]);
const NAME_REGEX = /^[\p{L}][\p{L}\s'-]*$/u;

router.get('/', async (req, res) => {
  console.log('[MEMBERS] GET / - Request received');
  const search = req.query.search && typeof req.query.search === 'string'
    ? req.query.search.trim() : '';
  const ministry = req.query.ministry && typeof req.query.ministry === 'string'
    ? req.query.ministry.trim() : '';
  const statusFilter = req.query.status && typeof req.query.status === 'string'
    ? req.query.status.trim() : '';

  console.log('[MEMBERS] Filters:', { search, ministry, statusFilter });

  try {
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (LOWER(m.first_name) LIKE ? OR LOWER(m.last_name) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }
    if (ministry) {
      where += ' AND m.ministry = ?';
      params.push(ministry);
    }
    if (statusFilter === 'visitor' || statusFilter === 'active') {
      where += ' AND m.status = ?';
      params.push(statusFilter);
    }

    const [rows] = await promisePool.query(
      `SELECT m.id, m.first_name, m.last_name, m.ministry, m.status, m.qr_code,
              m.registered_at, m.first_attendance_date,
              COUNT(a.id) AS attendance_count,
              MAX(a.attendance_date) AS last_attendance
       FROM members m
       LEFT JOIN attendance a ON a.member_id = m.id
       ${where}
       GROUP BY m.id
       ORDER BY m.first_name ASC, m.last_name ASC`,
      params
    );
    console.log('[MEMBERS] Query successful, rows:', rows.length);
    return res.status(200).json({ status: 'success', members: rows });
  } catch (err) {
    console.error('[MEMBERS] ERROR:', err.message);
    return res.status(500).json({ status: 'error', message: 'Failed to load members' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ status: 'error', message: 'Invalid id' });

  const first_name = req.body && typeof req.body.first_name === 'string'
    ? req.body.first_name.trim() : '';
  const last_name = req.body && typeof req.body.last_name === 'string'
    ? req.body.last_name.trim() : '';
  const ministry = req.body && typeof req.body.ministry === 'string'
    ? req.body.ministry.trim() : '';
  const status = req.body && typeof req.body.status === 'string'
    ? req.body.status.trim() : null;

  if (!first_name || !last_name || !ministry)
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  if (!NAME_REGEX.test(first_name) || !NAME_REGEX.test(last_name))
    return res.status(400).json({ status: 'error', message: 'Invalid name' });
  if (!ALLOWED_MINISTRIES.has(ministry))
    return res.status(400).json({ status: 'error', message: 'Invalid ministry' });
  if (status && !['visitor', 'active'].includes(status))
    return res.status(400).json({ status: 'error', message: 'Invalid status' });

  try {
    const [dup] = await promisePool.query(
      'SELECT id FROM members WHERE first_name = ? AND last_name = ? AND id != ?',
      [first_name, last_name, id]
    );
    if (dup.length > 0)
      return res.status(400).json({ status: 'error', message: 'Another member with this name already exists' });

    await promisePool.query(
      'UPDATE members SET first_name = ?, last_name = ?, ministry = ?, status = COALESCE(?, status) WHERE id = ?',
      [first_name, last_name, ministry, status || null, id]
    );
    return res.status(200).json({ status: 'success', message: 'Member updated' });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Failed to update member' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ status: 'error', message: 'Invalid id' });
  try {
    const [[{ count }]] = await promisePool.query(
      'SELECT COUNT(*) as count FROM attendance WHERE member_id = ?', [id]
    );
    if (count > 0)
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete — this member has ${count} attendance record${count !== 1 ? 's' : ''}. Remove attendance records first.`
      });
    await promisePool.query('DELETE FROM members WHERE id = ?', [id]);
    return res.status(200).json({ status: 'success', message: 'Member deleted' });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Failed to delete member' });
  }
});

module.exports = router;
