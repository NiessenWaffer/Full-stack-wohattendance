const express = require('express');
const bcrypt = require('bcryptjs');
const promisePool = require('./db').promisePool;
const router = express.Router();

router.post('/create', async (req, res) => {
  if (!req.admin || req.admin.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  const email = req.body && typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body && typeof req.body.password === 'string' ? req.body.password : '';
  const display_name = req.body && typeof req.body.display_name === 'string' ? req.body.display_name.trim() : 'Worker';
  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password are required' });
  }
  try {
    const [existing] = await promisePool.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    await promisePool.query(
      "INSERT INTO admins (email, password, display_name, role) VALUES (?, ?, ?, 'worker')",
      [email, hash, display_name]
    );
    return res.status(200).json({ status: 'success', message: 'Worker account created' });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Failed to create worker' });
  }
});

router.get('/', async (req, res) => {
  if (!req.admin || req.admin.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  try {
    const [rows] = await promisePool.query(
      'SELECT id, email, display_name, role FROM admins WHERE role = ?',
      ['worker']
    );
    return res.status(200).json({ status: 'success', workers: rows });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Failed to load workers' });
  }
});

router.delete('/:id', async (req, res) => {
  if (!req.admin || req.admin.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ status: 'error', message: 'Invalid id' });
  try {
    const [[target]] = await promisePool.query('SELECT role FROM admins WHERE id = ?', [id]);
    if (!target) return res.status(404).json({ status: 'error', message: 'Not found' });
    if (target.role === 'admin') {
      return res.status(400).json({ status: 'error', message: 'Cannot delete admin accounts' });
    }
    await promisePool.query('DELETE FROM admins WHERE id = ?', [id]);
    return res.status(200).json({ status: 'success', message: 'Worker deleted' });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Failed to delete worker' });
  }
});

module.exports = router;
