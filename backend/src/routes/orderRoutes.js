const express = require('express');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // all order routes require authentication

router.route('/').post(createOrder).get(protect, adminOnly, getAllOrders);
router.get('/myorders', getMyOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
