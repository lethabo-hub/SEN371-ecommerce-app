const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');

// app is built here separately from server.js so tests can
// import it directly without starting a real server
const createApp = () => {
  const app = express();

  // --- Security & performance middleware ---
  app.use(helmet());                 // sets protective HTTP headers (XSS, sniffing, clickjacking, etc.)
  app.use(compression());            // gzip response bodies
  app.use(cors());                   // allow the decoupled frontend (GitHub Pages) to call this API
  app.use(mongoSanitize());          // strips $ and . operators from user input to block NoSQL injection

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use(express.json({ limit: '10kb' })); // small body-size cap to blunt payload-flood attacks
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  app.use('/api', apiLimiter); // general throttle across the whole API surface

  app.get('/', (req, res) => {
    res.json({ success: true, message: 'ShopWave API is running', version: '2.0.0' });
  });

  app.get('/health', (req, res) => {
    res.json({ success: true, status: 'healthy', uptime: process.uptime() });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/wishlist', wishlistRoutes);
  app.use('/api/v1/subscribe', subscriberRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
