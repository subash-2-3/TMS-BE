const logger = require('../../utils/logger');
const { asyncHandler } = require('../../middlewares/errorHandler');
const service = require('./role.service');

exports.createRole = asyncHandler(async (req, res, next) => {
  try {
    const id = await service.create(req.body);

    logger.info('Role created via controller', { roleId: id, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
});

exports.getRoles = asyncHandler(async (req, res, next) => {
  try {
    const data = await service.getAll();

    logger.info('Roles list request handled', { count: data.length, userId: req.user.id });

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (err) {
    next(err);
  }
});

exports.getRoleById = asyncHandler(async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);

    logger.info('Role detail request handled', { roleId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

exports.updateRole = asyncHandler(async (req, res, next) => {
  try {
    await service.update(req.params.id, req.body);

    logger.info('Role update request handled', { roleId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

exports.deleteRole = asyncHandler(async (req, res, next) => {
  try {
    await service.softDelete(req.params.id);

    logger.info('Role deletion request handled', { roleId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});
