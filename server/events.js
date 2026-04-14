const express = require('express');
const promisePool = require('./db').promisePool;
const router = express.Router();

const ALLOWED_TYPES = new Set([
  'Sunday Service', 'Youth Night', 'Prayer Meeting', 'Outreach', 'Special'
]);

router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT e.id, e.event_name, e.event_date, e.event_type, e.notes, e.created_at,
              COALESCE(COUNT(DISTINCT a.id), 0) AS attendance_count
       FROM events e
       LEFT JOIN attendance a ON DATE(a.attendance_date) = DATE(e.event_date)
       GROUP BY e.id, e.event_name, e.event_date, e.event_type, e.notes, e.created_at
       ORDER BY e.event_date DESC`
    );
    return res.status(200).json({ status: 'success', events: rows });
  } catch (error) {
    console.error('[EVENTS] Failed to load events:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to load events' });
  }
});

router.post('/', async (req, res) => {
  const event_name = req.body && typeof req.body.event_name === 'string' ? req.body.event_name.trim() : '';
  const event_date = req.body && typeof req.body.event_date === 'string' ? req.body.event_date.trim() : '';
  const event_type = req.body && typeof req.body.event_type === 'string' ? req.body.event_type.trim() : '';
  const notes      = req.body && typeof req.body.notes === 'string' ? req.body.notes.trim() : null;

  if (!event_name || !event_date || !event_type)
    return res.status(400).json({ status: 'error', message: 'Event name, date, and type are required' });
  if (event_name.length > 150)
    return res.status(400).json({ status: 'error', message: 'Event name too long' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event_date))
    return res.status(400).json({ status: 'error', message: 'Invalid date format' });
  if (!ALLOWED_TYPES.has(event_type))
    return res.status(400).json({ status: 'error', message: 'Invalid event type' });

  try {
    const [result] = await promisePool.query(
      'INSERT INTO events (event_name, event_date, event_type, notes) VALUES (?, ?, ?, ?)',
      [event_name, event_date, event_type, notes || null]
    );
    return res.status(200).json({ status: 'success', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to create event' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ status: 'error', message: 'Invalid id' });

  const event_name = req.body && typeof req.body.event_name === 'string' ? req.body.event_name.trim() : '';
  const event_date = req.body && typeof req.body.event_date === 'string' ? req.body.event_date.trim() : '';
  const event_type = req.body && typeof req.body.event_type === 'string' ? req.body.event_type.trim() : '';
  const notes      = req.body && typeof req.body.notes === 'string' ? req.body.notes.trim() : null;

  if (!event_name || !event_date || !event_type)
    return res.status(400).json({ status: 'error', message: 'Event name, date, and type are required' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event_date))
    return res.status(400).json({ status: 'error', message: 'Invalid date format' });
  if (!ALLOWED_TYPES.has(event_type))
    return res.status(400).json({ status: 'error', message: 'Invalid event type' });

  try {
    await promisePool.query(
      'UPDATE events SET event_name = ?, event_date = ?, event_type = ?, notes = ? WHERE id = ?',
      [event_name, event_date, event_type, notes || null, id]
    );
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to update event' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ status: 'error', message: 'Invalid id' });
  try {
    await promisePool.query('DELETE FROM events WHERE id = ?', [id]);
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete event' });
  }
});

module.exports = router;
