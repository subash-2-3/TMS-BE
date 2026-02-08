const logger = require('../../utils/logger');
const { asyncHandler } = require('../../middlewares/errorHandler');
const service = require('./role.service');

exports.createRole = asyncHandler(async (req, res, next) => {
  try {
    // Check for duplicate role name
    const duplicate = await service.checkDuplicate(req.body.name);
    if (duplicate) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }

    const id = await service.create(req.body);
    logger.info('Role created via controller', { roleId: id, name: req.body.name });

    res.json({
      success: true,
      data: { id }
    });
  } catch (err) {
    next(err);
  }
});

exports.getRole = async (req, res) => {
  try {
    const id = req.params.id;
    const data = id ? await service.getById(id) : await service.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
