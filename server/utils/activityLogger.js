const { ActivityLog } = require('../models');

const logActivity = async (userId, action, module, details, ip) => {
  try {
    await ActivityLog.create({ user_id: userId, action, module, details, ip });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = { logActivity };
