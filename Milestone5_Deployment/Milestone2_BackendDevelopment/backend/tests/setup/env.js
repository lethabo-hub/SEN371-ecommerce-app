// Runs before every test file (wired up via "setupFiles" in package.json).
// The app reads these at runtime, so they must exist before anything is required.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'shopwave_test_secret_do_not_use_in_production';
process.env.JWT_EXPIRES_IN = '1h';
