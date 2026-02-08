const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    // 🔥 TEMPORARY ROLE CHECK DISABLE
    if (process.env.DISABLE_AUTH === 'true') {
      logger.debug('Authorization disabled - all roles allowed', { path: req.path });
      return next();
    }

    if (!req.user) {
      logger.warn('User not authenticated in authorize middleware', { path: req.path });
      return next(AppError.unauthorized('Unauthorized', 'USER_NOT_FOUND'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('User role not authorized for resource', {
        userId: req.user.id,
        userRole: req.user.role,
        allowedRoles,
        path: req.path
      });
      return next(AppError.forbidden('You do not have permission to access this resource', 'INSUFFICIENT_ROLE'));
    }

    logger.debug('User authorized successfully', { userId: req.user.id, role: req.user.role });
    next();
  };
};
