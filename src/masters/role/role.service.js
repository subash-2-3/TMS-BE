const db = require('../../db');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

exports.create = async (data) => {
  try {
    if (!data.name) {
      logger.warn('Create role validation failed - name is required', { data });
      throw AppError.badRequest('Role name is required', 'MISSING_NAME');
    }

    logger.debug('Creating role', { name: data.name });

    const [result] = await db.query(
      `INSERT INTO roles (name, description)
       VALUES (?, ?)`,
      [data.name, data.description || null]
    );

    logger.info('Role created successfully', { roleId: result.insertId, name: data.name });
    return result.insertId;
  } catch (err) {
    if (err.statusCode) throw err;
    if (err.code === 'ER_DUP_ENTRY') {
      logger.warn('Duplicate role name', { name: data.name });
      throw AppError.conflict('Role name already exists', 'DUPLICATE_NAME');
    }
    logger.error('Error creating role', err, { name: data.name });
    throw AppError.internalError('Failed to create role');
  }
};

exports.getAll = async () => {
  try {
    logger.debug('Fetching all roles');

    const [rows] = await db.query(
      `SELECT * FROM roles`
    );

    logger.info('Roles fetched successfully', { count: rows.length });
    return rows;
  } catch (err) {
    logger.error('Error fetching roles', err);
    throw AppError.internalError('Failed to fetch roles');
  }
};

exports.getById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid role ID provided', { id });
      throw AppError.badRequest('Valid role ID is required', 'INVALID_ROLE_ID');
    }

    logger.debug('Fetching role by ID', { roleId: id });

    const [[row]] = await db.query(
      `SELECT * FROM roles WHERE id = ?`,
      [id]
    );

    if (!row) {
      logger.warn('Role not found', { roleId: id });
      throw AppError.notFound(`Role with ID ${id} not found`, 'ROLE_NOT_FOUND');
    }

    logger.debug('Role fetched successfully', { roleId: id });
    return row;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error fetching role by ID', err, { id });
    throw AppError.internalError('Failed to fetch role');
  }
};

exports.update = async (id, data) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid role ID for update', { id });
      throw AppError.badRequest('Valid role ID is required', 'INVALID_ROLE_ID');
    }

    logger.debug('Updating role', { roleId: id, updatedFields: Object.keys(data) });

    const result = await db.query(
      `UPDATE roles SET ? WHERE id = ?`,
      [data, id]
    );

    logger.info('Role updated successfully', { roleId: id });
    return result;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error updating role', err, { id });
    throw AppError.internalError('Failed to update role');
  }
};

exports.softDelete = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid role ID for delete', { id });
      throw AppError.badRequest('Valid role ID is required', 'INVALID_ROLE_ID');
    }

    logger.debug('Deleting role', { roleId: id });

    await db.query(
      `DELETE FROM roles WHERE id = ?`,
      [id]
    );

    logger.info('Role deleted successfully', { roleId: id });
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error deleting role', err, { id });
    throw AppError.internalError('Failed to delete role');
  }
};
