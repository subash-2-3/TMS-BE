const service = require('./company.service');
const { createBase64DataURI } = require('../../utils/imageUpload.util');

exports.createCompany = async (req, res) => {
  try {
    // Check for duplicate email
    const duplicate = await service.checkDuplicate(req.body.email);
    if (duplicate) {
      return res.status(400).json({ message: 'Company with this email already exists' });
    }

    const companyLogo = req.file 
      ? createBase64DataURI(req.file.buffer, req.file.mimetype)
      : null;
    
    const id = await service.create({
      ...req.body,
      company_logo: companyLogo
    });
    
    res.status(201).json({ message: 'Company created', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompany = async (req, res) => {
  try {
    const id = req.params.id;
    const data = id ? await service.getById(id) : await service.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If new image is uploaded, convert to base64
    if (req.file) {
      updateData.company_logo = createBase64DataURI(req.file.buffer, req.file.mimetype);
    }
    
    await service.update(req.params.id, updateData);
    
    res.json({ message: 'Company updated', company_logo: updateData.company_logo });
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
