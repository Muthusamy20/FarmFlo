const { verifyAccessToken } = require('../utils/tokens');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash', 'refresh_token'] },
    });
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }
    req.user = user.toJSON();
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash', 'refresh_token'] },
      });
      if (user?.is_active) req.user = user.toJSON();
    }
  } catch (_) { /* ignore */ }
  next();
};

module.exports = { authenticate, optionalAuth };
