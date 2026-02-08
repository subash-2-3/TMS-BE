const service = require('./role.service');

exports.createRole = async (req, res) => {
  try {
    // Check for duplicate role name
    const duplicate = await service.checkDuplicate(req.body.name);
    if (duplicate) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }

    const id = await service.create(req.body);
    res.status(201).json({ message: 'Role created', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRole = async (req, res) => {
  try {
    const id = req.params.id;
    const data = id ? await service.getById(id) : await service.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    await service.update(req.params.id, req.body);
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await service.softDelete(req.params.id);
    res.json({ message: 'Role deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
