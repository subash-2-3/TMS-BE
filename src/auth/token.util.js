const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

require('dotenv').config();

exports.generateAccessToken = (user) => {
  try {
    if (!user || !user.id) {
      logger.warn('Generate access token - invalid user');
      throw AppError.badRequest('Valid user object is required', 'INVALID_USER');
    }

    logger.debug('Generating access token', { userId: user.id });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company_id: user.company_id
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' }
    );

    logger.debug('Access token generated successfully', { userId: user.id });
    return token;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error generating access token', err, { userId: user?.id });
    throw AppError.internalError('Failed to generate access token');
  }
};

exports.generateRefreshToken = (user) => {
  try {
    if (!user || !user.id) {
      logger.warn('Generate refresh token - invalid user');
      throw AppError.badRequest('Valid user object is required', 'INVALID_USER');
    }

    logger.debug('Generating refresh token', { userId: user.id });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );

    logger.debug('Refresh token generated successfully', { userId: user.id });
    return token;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error generating refresh token', err, { userId: user?.id });
    throw AppError.internalError('Failed to generate refresh token');
  }
};
