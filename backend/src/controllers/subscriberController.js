const asyncHandler = require('../utils/asyncHandler');
const Subscriber = require('../models/Subscriber');

// @desc    Subscribe an email to the newsletter
// @route   POST /api/v1/subscribe
// @access  Public
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const existing = await Subscriber.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(200).json({ success: true, message: "You're already on the list!" });
  }

  await Subscriber.create({ email });
  res.status(201).json({ success: true, message: 'Subscribed! Watch your inbox for trail-tested deals.' });
});

module.exports = { subscribe };
