const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * This must be the last middleware registered
 */
const errorHandler = (err, req, res, next) => {
  const startTime = req.startTime || Date.now();
  const responseTime = Date.now() - startTime;

  // Default error properties
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Something went wrong';

  // Log error with context
  const errorContext = {
    method: req.method,
    path: req.path,
    statusCode,
    errorCode,
    userId: req.user?.id || null,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    responseTimeMs: responseTime
  };

  logger.error(message, err, errorContext);

  // Send error response
  const errorResponse = {
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode,
      timestamp: new Date().toISOString()
    }
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err.additionalData;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};
