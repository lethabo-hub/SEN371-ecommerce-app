const mongoose = require('mongoose');

// stores emails from the newsletter signup form in the footer
const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscriber', subscriberSchema);
