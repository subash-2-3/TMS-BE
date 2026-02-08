const logger = require('../../utils/logger');
const { asyncHandler } = require('../../middlewares/errorHandler');
const service = require('./company.service');
const { createBase64DataURI } = require('../../utils/imageUpload.util');

exports.createCompany = asyncHandler(async (req, res, next) => {
  try {
    const id = await service.create(req.body);
    res.status(201).json({ message: 'Company created', id });
  } catch (err) {
    next(err);
  }
});

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
    next(err);
  }
});

exports.updateCompany = asyncHandler(async (req, res, next) => {
  try {
    await service.update(req.params.id, req.body);
    res.json({ message: 'Company updated' });
  } catch (err) {
    next(err);
  }
});

exports.deleteCompany = asyncHandler(async (req, res, next) => {
  try {
    await service.softDelete(req.params.id);

    logger.info('Company deactivation request handled', { companyId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      message: 'Company deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
});
