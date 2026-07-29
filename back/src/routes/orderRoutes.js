const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Optional auth: attach req.user if a valid token is present, but don't block guests
async function attachUserIfPresent(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  return protect(req, res, next);
}

router.post('/', attachUserIfPresent, createOrder); // guest or logged-in checkout
router.get('/mine', protect, getMyOrders); // customer order history
router.get('/', protectAdmin, getAllOrders); // admin: all orders
router.put('/:id/status', protectAdmin, updateOrderStatus); // admin: update status

module.exports = router;