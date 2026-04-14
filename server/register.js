const express = require('express');
const crypto = require('crypto');
const promisePool = require('./db').promisePool;
const { registerLimiter } = require('./limits');
const router = express.Router();
const ALLOWED_MINISTRIES = new Set([
  'Multimedia',
  'Praise and Worship',
  'Medical',
  'Children',
  'Young Professional',
  'Pastor',
  'Youth Alive'
]);
const NAME_REGEX = /^[\p{L}][\p{L}\s'-]*$/u;
function isValidName(value) {
  if (!value || value.length > 100) {
    return false;
  }
  return NAME_REGEX.test(value.trim());
}
async function generateUniqueQr() {
  for (let i = 0; i < 25; i += 1) {
    const qr_code = `WOH-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const [rows] = await promisePool.query(
      'SELECT id FROM members WHERE qr_code = ? LIMIT 1',
      [qr_code]
    );
    if (rows.length === 0) {
      return qr_code;
    }
  }
  throw new Error('Unique qr_code unavailable');
}
router.post('/register', registerLimiter, async (req, res) => {
  let first_name =
    req.body && typeof req.body.first_name === 'string'
      ? req.body.first_name.trim()
      : '';
  let last_name =
    req.body && typeof req.body.last_name === 'string'
      ? req.body.last_name.trim()
      : '';
  const ministryRaw =
    req.body && typeof req.body.ministry === 'string'
      ? req.body.ministry.trim()
      : '';
  if (!first_name || !last_name || !ministryRaw) {
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  }
  if (!isValidName(first_name) || !isValidName(last_name)) {
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  }
  first_name = first_name.trim();
  last_name = last_name.trim();
  const ministry = ministryRaw;
  if (!ALLOWED_MINISTRIES.has(ministry)) {
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  }
  try {
    const [rows] = await promisePool.query(
      'SELECT id FROM members WHERE first_name = ? AND last_name = ?',
      [first_name, last_name]
    );
    if (rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'Member already exists' });
    }
    const qr_code = await generateUniqueQr();
    const [result] = await promisePool.query(
      "INSERT INTO members (first_name, last_name, ministry, qr_code, status) VALUES (?, ?, ?, ?, 'visitor')",
      [first_name, last_name, ministry, qr_code]
    );
    return res.status(200).json({
      status: 'success',
      message: 'Member registered successfully',
      member: {
        id: result.insertId,
        first_name,
        last_name,
        ministry,
        qr_code,
        status: 'visitor'
      }
    });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Registration failed' });
  }
});
module.exports = router;
