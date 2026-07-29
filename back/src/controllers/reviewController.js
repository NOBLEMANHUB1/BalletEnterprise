const Review = require('../models/Review');
const Product = require('../models/Product');

// GET /api/products/:productId/reviews
async function getReviewsForProduct(req, res, next) {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

// POST /api/products/:productId/reviews
async function addReview(req, res, next) {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const { author, rating, comment } = req.body;

    if (!author || !rating || !comment) {
      return res.status(400).json({ message: 'Author, rating, and comment are all required.' });
    }

    const review = await Review.create({
      product: product._id,
      author,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:productId/reviews/summary — average rating + count
async function getRatingSummary(req, res, next) {
  try {
    const reviews = await Review.find({ product: req.params.productId });
    const count = reviews.length;
    const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    res.json({ average, count });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReviewsForProduct, addReview, getRatingSummary };