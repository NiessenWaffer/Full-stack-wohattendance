const express = require('express');
const promisePool = require('./db').promisePool;
const router = express.Router();

function formatNotifTime(dt) {
  const d = new Date(dt);
  const now = new Date();
  const todayStr = now.toDateString();
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  const h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  const timeStr = `${hr}:${m} ${ampm}`;
  if (d.toDateString() === todayStr) return { time: timeStr, date: 'Today' };
  if (d.toDateString() === yest.toDateString()) return { time: timeStr, date: 'Yesterday' };
  return { time: timeStr, date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
}

router.get('/', async (req, res) => {
  try {
    const [attendance] = await promisePool.query(
      `SELECT m.first_name, m.last_name, a.attendance_date, a.attendance_time,
              a.created_at AS ts, 'attendance' AS type
       FROM attendance a
       JOIN members m ON a.member_id = m.id
       ORDER BY a.created_at DESC LIMIT 5`
    );

    const [registrations] = await promisePool.query(
      `SELECT first_name, last_name, registered_at AS ts, 'registration' AS type
       FROM members
       ORDER BY registered_at DESC LIMIT 3`
    );

    const [logins] = await promisePool.query(
      `SELECT email, logged_in_at AS ts, 'login' AS type
       FROM sessions
       WHERE role = 'worker'
       ORDER BY logged_in_at DESC LIMIT 3`
    );

    const combined = [
      ...attendance.map(r => ({
        type: 'attendance',
        title: `${r.first_name} ${r.last_name} marked present`,
        ts: r.ts
      })),
      ...registrations.map(r => ({
        type: 'registration',
        title: `${r.first_name} ${r.last_name} registered`,
        ts: r.ts
      })),
      ...logins.map(r => ({
        type: 'login',
        title: 'Worker logged in',
        subtitle: r.email,
        ts: r.ts
      }))
    ];

    combined.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    const latest = combined.slice(0, 10);

    const notifications = latest.map(n => {
      const { time, date } = formatNotifTime(n.ts);
      return { type: n.type, title: n.title, subtitle: n.subtitle || null, time, date };
    });

    return res.status(200).json({
      status: 'success',
      notifications,
      unread_count: notifications.length
    });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Failed to load notifications' });
  }
});

module.exports = router;
