const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many login attempts, please try again later'
    });
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many registration attempts, please try again later'
    });
  }
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 scans per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many scan attempts, please slow down'
    });
  }
});

module.exports = { loginLimiter, registerLimiter, scanLimiter };
