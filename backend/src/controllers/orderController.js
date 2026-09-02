const asyncHandler = require('../utils/asyncHandler');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create a new order from the user's cart (checkout)
// @route   POST /api/v1/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  if (
    !shippingAddress ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.postalCode ||
    !shippingAddress.country
  ) {
    res.status(400);
    throw new Error('A complete shipping address is required');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cannot checkout with an empty cart');
  }

  // Validate stock and build order items
  const orderItems = [];
  let totalPrice = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product) continue;

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
    totalPrice += product.price * item.quantity;

    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalPrice,
    shippingAddress,
  });

  // Clear the cart after successful checkout
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/v1/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
});

// @desc    Get all orders (admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
});

// @desc    Update order status (admin)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  const updated = await order.save();

  res.status(200).json({ success: true, data: updated });
});

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
