const ActivityLog = require('../models/ActivityLog');
const logActivity = require('../utils/logActivity');

// GET /api/activity — admin only. Supports ?category=Auth|Cart|Orders|System and ?search=
async function getLogs(req, res, next) {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { user: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

// POST /api/activity — public. Used for client-side-only events (like adding
// to cart) that the backend otherwise has no visibility into. Restricted to
// the 'Cart' category so this endpoint can't be used to spam fake Auth/Orders/
// System entries into the log.
async function createCartLog(req, res, next) {
  try {
    const { action, user, details } = req.body;

    if (!action) {
      return res.status(400).json({ message: 'Missing action.' });
    }

    await logActivity({ category: 'Cart', action, user, details, req });
    res.status(201).json({ message: 'Logged.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLogs, createCartLog };