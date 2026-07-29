const express = require('express');
const router = express.Router();
const { verifyPayment } = require('../controllers/paymentController');

// Public — the frontend calls this right after Paystack's popup succeeds,
// before the order actually gets created.
router.post('/verify', verifyPayment);

module.exports = router;