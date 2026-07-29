const mongoose = require('mongoose');

// A single-document collection holding site-wide settings.
// baseCurrency: the currency the admin actually enters product prices in.
// usdToGhsRate: always "how many GHS equal 1 USD" -- used to convert between
// the base currency and the other one, whichever way that goes.
const settingsSchema = new mongoose.Schema(
  {
    baseCurrency: { type: String, enum: ['USD', 'GHS'], default: 'GHS' },
    usdToGhsRate: { type: Number, required: true, default: 15.5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingsSchema);