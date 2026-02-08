const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');
const { asyncHandler } = require('../../middlewares/errorHandler');
const service = require('./user.service');
const { createBase64DataURI } = require('../../utils/imageUpload.util');

exports.createUser = asyncHandler(async (req, res, next) => {
  try {
    // Check for duplicate email
    const duplicate = await service.checkDuplicate(req.body.email);
    if (duplicate) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const profileImage = req.file 
      ? createBase64DataURI(req.file.buffer, req.file.mimetype)
      : null;

    const id = await service.create({
      ...req.body,
      password_hash: hashedPassword,
      profile_image: profileImage
    });

    logger.info('User created via controller', { userId: id, email: req.body.email });

    res.json({
      success: true,
      data: { id }
    });
  } catch (err) {
    next(err);
  }
});

exports.getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const data = id ? await service.getById(id) : await service.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }};

exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    
    // If new image is uploaded, convert to base64
    if (req.file) {
      updateData.profile_image = createBase64DataURI(req.file.buffer, req.file.mimetype);
    }
    
    await service.update(req.params.id, updateData);
    
    res.json({ message: 'User updated', profile_image: updateData.profile_image });
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
