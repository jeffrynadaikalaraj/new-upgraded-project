const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('[Auth] No token found in headers:', req.headers);
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      console.log('[Auth] Token decoded but user not found:', decoded.id);
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    next();
  } catch (err) {
    console.error('[Auth] JWT Verify Error:', err.message, 'Token:', token ? token.substring(0, 15) + '...' : 'null');
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

module.exports = { protect };
