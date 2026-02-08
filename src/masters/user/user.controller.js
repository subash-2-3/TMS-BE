const bcrypt = require('bcryptjs');
const service = require('./user.service');
const { createBase64DataURI } = require('../../utils/imageUpload.util');

exports.createUser = async (req, res) => {
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

    res.status(201).json({ message: 'User created', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const data = id ? await service.getById(id) : await service.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If new image is uploaded, convert to base64
    if (req.file) {
      updateData.profile_image = createBase64DataURI(req.file.buffer, req.file.mimetype);
    }
    
    await service.update(req.params.id, updateData);
    
    res.json({ message: 'User updated', profile_image: updateData.profile_image });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await service.softDelete(req.params.id);
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
