const express = require('express');
const { getCart, addItemToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // all cart routes require authentication

router.route('/').get(getCart).post(addItemToCart);
router.route('/:productId').put(updateCartItem).delete(removeCartItem);

module.exports = router;
