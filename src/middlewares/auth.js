const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
require('dotenv').config();

module.exports = (req, res, next) => {

  // 🔥 TEMPORARY AUTH DISABLE
  if (process.env.DISABLE_AUTH === 'true') {
    logger.warn('Authentication disabled - using mock user', { ip: req.ip });
    // mock logged-in user
    req.user = {
      id: 1,
      role: 'Admin',
      company_id: 1
    };
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn('Missing authentication token', { path: req.path, ip: req.ip });
    return next(AppError.unauthorized('Token missing', 'TOKEN_MISSING'));
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Invalid authorization header format', { path: req.path, ip: req.ip });
    return next(AppError.unauthorized('Invalid token format', 'INVALID_TOKEN_FORMAT'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    logger.debug('Token verified successfully', { userId: decoded.id });
    next();
  } catch (err) {
    logger.warn('Token verification failed', { error: err.message, path: req.path, ip: req.ip });
    
    if (err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token expired', 'TOKEN_EXPIRED'));
    }
    
    return next(AppError.unauthorized('Invalid token', 'INVALID_TOKEN'));
  }
};
