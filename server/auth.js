const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const promisePool = require('./db').promisePool;
const { loginLimiter } = require('./limits');
const router = express.Router();
const GENERIC_AUTH_ERROR = 'Invalid email or password';
const MAX_EMAIL_LEN = 255;
const MAX_PASSWORD_LEN = 255;
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
router.post('/login', loginLimiter, async (req, res) => {
  const emailRaw =
    req.body && typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const password =
    req.body && typeof req.body.password === 'string' ? req.body.password : '';

  console.log('[AUTH] email received:', emailRaw);
  console.log('[AUTH] password received:', password ? '(has value, length=' + password.length + ')' : '(empty)');

  if (!emailRaw || !password) {
    console.log('[AUTH] FAIL: missing email or password');
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required'
    });
  }
  if (emailRaw.length > MAX_EMAIL_LEN || password.length > MAX_PASSWORD_LEN) {
    console.log('[AUTH] FAIL: field too long');
    return res.status(400).json({ status: 'error', message: GENERIC_AUTH_ERROR });
  }
  const email = emailRaw.toLowerCase();
  try {
    const [rows] = await promisePool.query(
      'SELECT id, email, password, display_name, role FROM admins WHERE LOWER(email) = ?',
      [email]
    );
    console.log('[AUTH] DB rows found:', rows.length);
    if (rows.length === 0) {
      console.log('[AUTH] FAIL: no admin found for email:', email);
      return res.status(401).json({ status: 'error', message: GENERIC_AUTH_ERROR });
    }
    const admin = rows[0];
    console.log('[AUTH] hash in DB:', admin.password);
    const isValidPassword = await bcrypt.compare(password, admin.password);
    console.log('[AUTH] bcrypt.compare result:', isValidPassword);
    if (!isValidPassword) {
      console.log('[AUTH] FAIL: password does not match hash');
      return res.status(401).json({ status: 'error', message: GENERIC_AUTH_ERROR });
    }
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    const [sessionResult] = await promisePool.query(
      'INSERT INTO sessions (user_id, email, role) VALUES (?, ?, ?)',
      [admin.id, admin.email, admin.role]
    );
    await promisePool.query(
      'UPDATE sessions SET is_active = 0 WHERE user_id = ? AND id != ?',
      [admin.id, sessionResult.insertId]
    );
    console.log('[AUTH] SUCCESS: token issued for', admin.email);
    return res.status(200).json({
      status: 'success',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        display_name: admin.display_name,
        role: admin.role
      }
    });
  } catch (err) {
    console.log('[AUTH] EXCEPTION:', err.message);
    return res.status(500).json({ status: 'error', message: GENERIC_AUTH_ERROR });
  }
});
module.exports = router;
