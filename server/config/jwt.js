require('dotenv').config();

module.exports = {
  accessSecret: process.env.JWT_SECRET || 'dev-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  accessExpiry: '15m',
  refreshExpiry: '7d',
  refreshExpiryRemember: '30d',
};
