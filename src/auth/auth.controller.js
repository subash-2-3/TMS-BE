const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const userService = require('../masters/user/user.service');
const refreshTokenService = require('./refreshToken.service');
const tokenUtil = require('./token.util');
const { asyncHandler } = require('../middlewares/errorHandler');
require('dotenv').config();

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    logger.warn('Login attempt with missing credentials', { email });
    return next(AppError.badRequest('Email and password are required', 'MISSING_CREDENTIALS'));
  }

  if (!email.includes('@')) {
    logger.warn('Login attempt with invalid email format', { email });
    return next(AppError.badRequest('Invalid email format', 'INVALID_EMAIL'));
  }

  logger.info('Login attempt', { email });

  const user = await userService.getByEmail(email);
  if (!user) {
    logger.warn('Login failed - user not found', { email });
    return next(AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS'));
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    logger.warn('Login failed - invalid password', { email, userId: user.id });
    return next(AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS'));
  }

  try {
    const accessToken = tokenUtil.generateAccessToken(user);
    const refreshToken = tokenUtil.generateRefreshToken(user);

    const decoded = jwt.decode(refreshToken);

    await refreshTokenService.save(
      user.id,
      refreshToken,
      new Date(decoded.exp * 1000)
    );

    logger.info('User logged in successfully', { userId: user.id, email });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email,
          role: user.role
        }
      }
    });
  } catch (err) {
    logger.error('Error during token generation or refresh token save', err, { userId: user.id });
    return next(AppError.internalError('Failed to generate tokens'));
  }
});

exports.logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  const userId = req.user?.id;

  if (!refreshToken) {
    logger.warn('Logout attempt without refresh token', { userId });
    return next(AppError.badRequest('Refresh token is required', 'MISSING_REFRESH_TOKEN'));
  }

  try {
    await refreshTokenService.delete(refreshToken);
    logger.info('User logged out successfully', { userId });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    logger.error('Error during logout', err, { userId });
    return next(AppError.internalError('Failed to logout'));
  }
});

