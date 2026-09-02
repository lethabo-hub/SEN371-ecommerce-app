// Wraps async controller functions so thrown errors are forwarded to errorHandler middleware
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
