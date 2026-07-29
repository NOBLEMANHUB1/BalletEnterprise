const Setting = require('../models/Setting');

// There's only ever one settings document -- this finds it, or creates it
// with defaults the very first time anyone asks.
async function getOrCreateSettings() {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  return settings;
}

// GET /api/settings/exchange-rate -- public, anyone can read the current settings
async function getExchangeRate(req, res, next) {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      baseCurrency: settings.baseCurrency,
      usdToGhsRate: settings.usdToGhsRate,
      updatedAt: settings.updatedAt
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/settings/exchange-rate -- admin only
async function updateExchangeRate(req, res, next) {
  try {
    const { usdToGhsRate, baseCurrency } = req.body;

    if (usdToGhsRate !== undefined && (typeof usdToGhsRate !== 'number' || usdToGhsRate <= 0)) {
      return res.status(400).json({ message: 'Please provide a valid positive exchange rate.' });
    }

    if (baseCurrency !== undefined && !['USD', 'GHS'].includes(baseCurrency)) {
      return res.status(400).json({ message: 'Base currency must be USD or GHS.' });
    }

    const settings = await getOrCreateSettings();
    if (usdToGhsRate !== undefined) settings.usdToGhsRate = usdToGhsRate;
    if (baseCurrency !== undefined) settings.baseCurrency = baseCurrency;
    await settings.save();

    res.json({
      baseCurrency: settings.baseCurrency,
      usdToGhsRate: settings.usdToGhsRate,
      updatedAt: settings.updatedAt
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getExchangeRate, updateExchangeRate };