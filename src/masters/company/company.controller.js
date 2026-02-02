const service = require('./company.service');

exports.createCompany = async (req, res) => {
  try {
    const id = await service.create(req.body);
    res.status(201).json({ message: 'Company created', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    await service.update(req.params.id, req.body);
    res.json({ message: 'Company updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    await service.softDelete(req.params.id);
    res.json({ message: 'Company deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
