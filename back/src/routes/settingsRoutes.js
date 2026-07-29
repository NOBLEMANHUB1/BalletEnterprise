const express = require('express');
const router = express.Router();
const { getExchangeRate, updateExchangeRate } = require('../controllers/settingsController');
const { protectAdmin } = require('../middleware/adminMiddleware');

router.get('/exchange-rate', getExchangeRate);
router.put('/exchange-rate', protectAdmin, updateExchangeRate);

module.exports = router;