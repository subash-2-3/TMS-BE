const db = require('../../db');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

exports.create = async (data) => {
  try {
    if (!data.name || !data.email || !data.phone) {
      logger.warn('Create company validation failed - missing required fields', { name: data.name });
      throw AppError.badRequest('Name, Email, and Phone are required', 'MISSING_REQUIRED_FIELDS', {
        requiredFields: ['name', 'email', 'phone']
      });
    }

    logger.debug('Creating company', { name: data.name, email: data.email });

    const [result] = await db.query(
      `INSERT INTO companies (name, email, phone, address)
       VALUES (?, ?, ?, ?)`,
      [data.name, data.email, data.phone, data.address || null]
    );

    logger.info('Company created successfully', { companyId: result.insertId, name: data.name });
    return result.insertId;
  } catch (err) {
    if (err.statusCode) throw err;
    if (err.code === 'ER_DUP_ENTRY') {
      logger.warn('Duplicate company email', { email: data.email });
      throw AppError.conflict('Email already exists', 'DUPLICATE_EMAIL');
    }
    logger.error('Error creating company', err, { name: data.name });
    throw AppError.internalError('Failed to create company');
  }
};

exports.getAll = async () => {
  try {
    logger.debug('Fetching all companies');

    const [rows] = await db.query(
      `SELECT * FROM companies WHERE is_active = 1`
    );

    logger.info('Companies fetched successfully', { count: rows.length });
    return rows;
  } catch (err) {
    logger.error('Error fetching companies', err);
    throw AppError.internalError('Failed to fetch companies');
  }
};

exports.getById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid company ID provided', { id });
      throw AppError.badRequest('Valid company ID is required', 'INVALID_COMPANY_ID');
    }

    logger.debug('Fetching company by ID', { companyId: id });

    const [[row]] = await db.query(
      `SELECT * FROM companies WHERE id = ? AND is_active = 1`,
      [id]
    );

    if (!row) {
      logger.warn('Company not found', { companyId: id });
      throw AppError.notFound(`Company with ID ${id} not found`, 'COMPANY_NOT_FOUND');
    }

    logger.debug('Company fetched successfully', { companyId: id });
    return row;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error fetching company by ID', err, { id });
    throw AppError.internalError('Failed to fetch company');
  }
};

exports.update = async (id, data) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid company ID for update', { id });
      throw AppError.badRequest('Valid company ID is required', 'INVALID_COMPANY_ID');
    }

    logger.debug('Updating company', { companyId: id, updatedFields: Object.keys(data) });

    const result = await db.query(
      `UPDATE companies SET ? WHERE id = ?`,
      [data, id]
    );

    logger.info('Company updated successfully', { companyId: id });
    return result;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error updating company', err, { id });
    throw AppError.internalError('Failed to update company');
  }
};

exports.softDelete = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid company ID for soft delete', { id });
      throw AppError.badRequest('Valid company ID is required', 'INVALID_COMPANY_ID');
    }

    logger.debug('Soft deleting company', { companyId: id });

    await db.query(
      `UPDATE companies SET is_active = 0 WHERE id = ?`,
      [id]
    );

    logger.info('Company deactivated successfully', { companyId: id });
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error deactivating company', err, { id });
    throw AppError.internalError('Failed to deactivate company');
  }
};
