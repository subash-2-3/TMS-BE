const logger = require('../../utils/logger');
const { asyncHandler } = require('../../middlewares/errorHandler');
const service = require('./company.service');

exports.createCompany = asyncHandler(async (req, res, next) => {
  try {
    const id = await service.create(req.body);

    logger.info('Company created via controller', { companyId: id, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
});

exports.getCompanies = asyncHandler(async (req, res, next) => {
  try {
    const data = await service.getAll();

    logger.info('Companies list request handled', { count: data.length, userId: req.user.id });

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (err) {
    next(err);
  }
});

exports.getCompanyById = asyncHandler(async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);

    logger.info('Company detail request handled', { companyId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

exports.updateCompany = asyncHandler(async (req, res, next) => {
  try {
    await service.update(req.params.id, req.body);

    logger.info('Company update request handled', { companyId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      message: 'Company updated successfully'
    });
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
