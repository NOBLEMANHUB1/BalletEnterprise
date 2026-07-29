const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const {
  getReviewsForProduct,
  addReview,
  getRatingSummary
} = require('../controllers/reviewController');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:productId/reviews', getReviewsForProduct);
router.get('/:productId/reviews/summary', getRatingSummary);
router.post('/:productId/reviews', addReview); // anyone can leave a review, front-end only checks name/rating/comment

// Admin only
router.post('/', protectAdmin, createProduct);
router.put('/:id', protectAdmin, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

module.exports = router;