const asyncHandler = require('../utils/asyncHandler');
const Review = require('../models/Review');
const Product = require('../models/Product');

// Recalculates and persists a product's averageRating + numReviews after any review change.
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
};

// @desc    Get all reviews for a product
// @route   GET /api/v1/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: reviews });
});

// @desc    Create a review for a product (one per user per product)
// @route   POST /api/v1/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.name,
    rating,
    comment,
  });

  await recalculateProductRating(productId);

  res.status(201).json({ success: true, data: review });
});

// @desc    Delete own review (or admin can delete any)
// @route   DELETE /api/v1/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  await review.deleteOne();
  await recalculateProductRating(review.product);

  res.status(200).json({ success: true, message: 'Review removed' });
});

module.exports = { getProductReviews, createProductReview, deleteProductReview };
