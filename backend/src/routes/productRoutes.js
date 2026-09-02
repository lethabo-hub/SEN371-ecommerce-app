const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  getProductReviews,
  createProductReview,
  deleteProductReview,
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { productRules, reviewRules } = require('../middleware/validators');

const router = express.Router();

router.route('/').get(getProducts).post(protect, adminOnly, productRules, createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

// Product reviews (nested resource)
router.route('/:id/reviews').get(getProductReviews).post(protect, reviewRules, createProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);

module.exports = router;
