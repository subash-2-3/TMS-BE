const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');
const { asyncHandler } = require('../../middlewares/errorHandler');
const service = require('./user.service');

exports.createUser = asyncHandler(async (req, res, next) => {
  try {
    if (!req.body.password) {
      logger.warn('Create user request missing password', { email: req.body.email });
      return next(AppError.badRequest('Password is required', 'MISSING_PASSWORD'));
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const id = await service.create({
      ...req.body,
      password_hash: hashedPassword
    });

    logger.info('User created via controller', { userId: id, email: req.body.email });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  try {
    const data = await service.getAll();

    logger.info('Users list request handled', { count: data.length, userId: req.user.id });

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (err) {
    next(err);
  }
});

exports.getUserById = asyncHandler(async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);

    logger.info('User detail request handled', { requestedUserId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    await service.update(req.params.id, req.body);

    logger.info('User update request handled', { updatedUserId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  try {
    await service.softDelete(req.params.id);

    logger.info('User deactivation request handled', { deactivatedUserId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
});
