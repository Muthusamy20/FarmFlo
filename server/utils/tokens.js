const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const generateToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const signAccessToken = (payload) =>
  jwt.sign(payload, jwtConfig.accessSecret, { expiresIn: jwtConfig.accessExpiry });

const signRefreshToken = (payload, remember = false) =>
  jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: remember ? jwtConfig.refreshExpiryRemember : jwtConfig.refreshExpiry,
  });

const verifyAccessToken = (token) => jwt.verify(token, jwtConfig.accessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, jwtConfig.refreshSecret);

module.exports = {
  generateToken,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
