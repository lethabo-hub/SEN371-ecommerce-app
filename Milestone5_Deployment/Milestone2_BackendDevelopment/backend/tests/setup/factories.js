const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const Product = require('../../src/models/Product');

let counter = 0;

// Unique-per-call so the unique index on User.email never collides by accident.
const uniqueEmail = (prefix = 'user') => `${prefix}.${Date.now()}.${counter++}@shopwave.test`;

// Users are created straight through the model rather than by calling
// POST /auth/register. The register/login routes are behind a rate limiter
// (20 requests per IP per 15 minutes) and hammering them from every test file
// would eventually return 429 instead of the status we are asserting on.
const createUser = async (overrides = {}) =>
  User.create({
    name: overrides.name || 'Test Customer',
    email: overrides.email || uniqueEmail(),
    password: overrides.password || 'Password123',
    role: overrides.role || 'customer',
  });

const createAdmin = async (overrides = {}) =>
  createUser({ name: 'Test Admin', email: uniqueEmail('admin'), role: 'admin', ...overrides });

// Mirrors src/utils/generateToken.js so tokens are accepted by the protect middleware.
const tokenFor = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

const asCustomer = async (overrides = {}) => {
  const user = await createUser(overrides);
  return { user, token: tokenFor(user) };
};

const asAdmin = async (overrides = {}) => {
  const user = await createAdmin(overrides);
  return { user, token: tokenFor(user) };
};

const createProduct = async (overrides = {}) =>
  Product.create({
    name: 'Trail Runner 30L Backpack',
    description: 'A durable 30 litre hiking backpack built for long trails.',
    price: 799.99,
    category: 'Outdoor',
    stock: 10,
    ...overrides,
  });

// Convenience for building the Authorization header Supertest needs.
const bearer = (token) => `Bearer ${token}`;

module.exports = {
  uniqueEmail,
  createUser,
  createAdmin,
  tokenFor,
  asCustomer,
  asAdmin,
  createProduct,
  bearer,
};
