const ActivityLog = require('../models/ActivityLog');

// Fire-and-forget logging — never let a logging failure break the real
// request that triggered it (signup/order/etc still succeeds either way).
async function logActivity({ category, action, user, details, req }) {
  try {
    await ActivityLog.create({
      category,
      action,
      user: user || 'Guest',
      details: details || '',
      sourceIp: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : ''
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
}

module.exports = logActivity;