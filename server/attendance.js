const express = require('express');
const promisePool = require('./db').promisePool;
const router = express.Router();

const ACTIVE_THRESHOLD = 3;

// Shared post-attendance logic: update first_attendance_date, count, and auto-promote status
async function updateMemberEngagement(memberId, isFirstAttendance) {
  if (isFirstAttendance) {
    await promisePool.query(
      'UPDATE members SET first_attendance_date = CURDATE() WHERE id = ? AND first_attendance_date IS NULL',
      [memberId]
    );
  }

  const [[{ cnt }]] = await promisePool.query(
    'SELECT COUNT(*) AS cnt FROM attendance WHERE member_id = ?',
    [memberId]
  );

  if (cnt >= ACTIVE_THRESHOLD) {
    await promisePool.query(
      "UPDATE members SET status = 'active' WHERE id = ? AND status = 'visitor'",
      [memberId]
    );
  }
}

router.post('/scan', async (req, res) => {
  const qr_code = req.body && typeof req.body.qr_code === 'string' ? req.body.qr_code.trim() : '';
  if (!qr_code) {
    return res.status(400).json({ status: 'error', message: 'qr_code is required' });
  }

  try {
    const [members] = await promisePool.query(
      'SELECT id, first_name, last_name, ministry, status, first_attendance_date FROM members WHERE qr_code = ? LIMIT 1',
      [qr_code]
    );

    if (members.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Member not found' });
    }

    const member = members[0];

    const [existing] = await promisePool.query(
      'SELECT id FROM attendance WHERE member_id = ? AND attendance_date = CURDATE()',
      [member.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'duplicate',
        message: "Already exists in today's attendance",
        member_id: member.id,
        member_name: `${member.first_name} ${member.last_name}`
      });
    }

    const attendanceTime = new Date().toTimeString().slice(0, 8);
    await promisePool.query(
      'INSERT INTO attendance (member_id, attendance_date, attendance_time) VALUES (?, CURDATE(), ?)',
      [member.id, attendanceTime]
    );

    await updateMemberEngagement(member.id, !member.first_attendance_date);

    // Re-fetch updated status
    const [[updated]] = await promisePool.query(
      'SELECT status FROM members WHERE id = ?',
      [member.id]
    );

    return res.status(200).json({
      status: 'success',
      member: {
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        ministry: member.ministry,
        status: updated.status
      },
      attendance_time: attendanceTime
    });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Attendance scan failed' });
  }
});

router.post('/mark', async (req, res) => {
  const member_id = req.body && typeof req.body.member_id === 'number' ? req.body.member_id : null;
  if (!member_id) {
    return res.status(400).json({ status: 'error', message: 'member_id is required' });
  }

  try {
    const [existing] = await promisePool.query(
      'SELECT id FROM attendance WHERE member_id = ? AND attendance_date = CURDATE()',
      [member_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ status: 'duplicate', message: "Already exists in today's attendance" });
    }

    const [members] = await promisePool.query(
      'SELECT id, first_name, last_name, ministry, status, first_attendance_date FROM members WHERE id = ?',
      [member_id]
    );
    if (members.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Member not found' });
    }

    const member = members[0];
    const attendanceTime = new Date().toTimeString().slice(0, 8);

    await promisePool.query(
      'INSERT INTO attendance (member_id, attendance_date, attendance_time) VALUES (?, CURDATE(), ?)',
      [member_id, attendanceTime]
    );

    await updateMemberEngagement(member.id, !member.first_attendance_date);

    const [[updated]] = await promisePool.query(
      'SELECT status FROM members WHERE id = ?',
      [member.id]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Attendance marked',
      member: {
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        ministry: member.ministry,
        status: updated.status,
        attendance_time: attendanceTime
      }
    });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Attendance marking failed' });
  }
});

router.get('/today', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT a.id, a.member_id, a.attendance_date, a.attendance_time,
              m.first_name, m.last_name, m.ministry, m.status
       FROM attendance a
       JOIN members m ON a.member_id = m.id
       WHERE a.attendance_date = CURDATE()
       ORDER BY a.attendance_time DESC`
    );
    return res.status(200).json({ status: 'success', records: rows });
  } catch {
    return res.status(500).json({ status: 'error', message: "Failed to load today's attendance" });
  }
});

router.get('/members/search', async (req, res) => {
  const q = req.query.q && typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q) {
    return res.status(400).json({ status: 'error', message: 'q query parameter is required' });
  }
  try {
    const searchTerm = `%${q.toLowerCase()}%`;
    const [rows] = await promisePool.query(
      `SELECT id, first_name, last_name, ministry, status
       FROM members
       WHERE LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ?
       ORDER BY first_name ASC, last_name ASC
       LIMIT 50`,
      [searchTerm, searchTerm]
    );
    return res.status(200).json({ status: 'success', members: rows });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Member search failed' });
  }
});

module.exports = router;
