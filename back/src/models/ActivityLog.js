const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['Auth', 'Cart', 'Orders', 'System'], required: true },
    action: { type: String, required: true }, // short human-readable summary
    user: { type: String, default: 'Guest' }, // name/contact of whoever triggered it
    details: { type: String, default: '' }, // extra context
    sourceIp: { type: String, default: '' }
  },
  { timestamps: true }
);

// newest-first is how the admin dashboard always wants these
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);