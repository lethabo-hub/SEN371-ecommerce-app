const express = require('express');
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerRules, loginRules } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerRules, registerUser);
router.post('/login', authLimiter, loginRules, loginUser);
router.get('/profile', protect, getProfile);

module.exports = router;
