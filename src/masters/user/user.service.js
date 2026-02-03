const db = require('../../db');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

exports.create = async (data) => {
  try {
    if (!data.company_id || !data.role_id || !data.name || !data.email || !data.password_hash) {
      logger.warn('Create user validation failed - missing required fields', { email: data.email });
      throw AppError.badRequest('Missing required fields', 'MISSING_REQUIRED_FIELDS', {
        requiredFields: ['company_id', 'role_id', 'name', 'email', 'password_hash']
      });
    }

    logger.debug('Creating user', { email: data.email, name: data.name });

    const [result] = await db.query(
      `INSERT INTO users 
       (company_id, role_id, name, email, password_hash, profile_image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.company_id,
        data.role_id,
        data.name,
        data.email,
        data.password_hash,
        data.profile_image || null
      ]
    );

    logger.info('User created successfully', { userId: result.insertId, email: data.email });
    return result.insertId;
  } catch (err) {
    if (err.statusCode) throw err;
    if (err.code === 'ER_DUP_ENTRY') {
      logger.warn('Duplicate email entry', { email: data.email });
      throw AppError.conflict('Email already exists', 'DUPLICATE_EMAIL');
    }
    logger.error('Error creating user', err, { email: data.email });
    throw AppError.internalError('Failed to create user');
  }
};

exports.getAll = async () => {
  try {
    logger.debug('Fetching all users');

    const [rows] = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.is_active,
        c.name AS company,
        r.name AS role
      FROM users u
      JOIN companies c ON c.id = u.company_id
      JOIN roles r ON r.id = u.role_id
      WHERE u.is_active = 1
    `);

    logger.info('Users fetched successfully', { count: rows.length });
    return rows;
  } catch (err) {
    logger.error('Error fetching users', err);
    throw AppError.internalError('Failed to fetch users');
  }
};

exports.getByEmail = async (email) => {
  try {
    if (!email) {
      logger.warn('Email not provided for getByEmail');
      throw AppError.badRequest('Email is required', 'MISSING_EMAIL');
    }

    logger.debug('Fetching user by email', { email });

    const [[row]] = await db.query(
      `SELECT 
         u.id,
         u.company_id,
         u.password_hash,
         r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = ? AND u.is_active = 1`,
      [email]
    );

    if (!row) {
      logger.debug('User not found by email', { email });
      return null;
    }

    logger.debug('User found by email', { userId: row.id, email });
    return row;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error fetching user by email', err, { email });
    throw AppError.internalError('Failed to fetch user');
  }
};

exports.getById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid user ID provided', { id });
      throw AppError.badRequest('Valid user ID is required', 'INVALID_USER_ID');
    }

    logger.debug('Fetching user by ID', { userId: id });

    const [[row]] = await db.query(
      `SELECT * FROM users WHERE id = ? AND is_active = 1`,
      [id]
    );

    if (!row) {
      logger.warn('User not found', { userId: id });
      throw AppError.notFound(`User with ID ${id} not found`, 'USER_NOT_FOUND');
    }

    logger.debug('User fetched successfully', { userId: id });
    return row;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error fetching user by ID', err, { id });
    throw AppError.internalError('Failed to fetch user');
  }
};

exports.update = async (id, data) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid user ID for update', { id });
      throw AppError.badRequest('Valid user ID is required', 'INVALID_USER_ID');
    }

    logger.debug('Updating user', { userId: id, updatedFields: Object.keys(data) });

    const result = await db.query(`UPDATE users SET ? WHERE id = ?`, [data, id]);

    logger.info('User updated successfully', { userId: id });
    return result;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error updating user', err, { id });
    throw AppError.internalError('Failed to update user');
  }
};

exports.softDelete = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid user ID for soft delete', { id });
      throw AppError.badRequest('Valid user ID is required', 'INVALID_USER_ID');
    }

    logger.debug('Soft deleting user', { userId: id });

    await db.query(
      `UPDATE users SET is_active = 0 WHERE id = ?`,
      [id]
    );

    logger.info('User deactivated successfully', { userId: id });
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error deactivating user', err, { id });
    throw AppError.internalError('Failed to deactivate user');
  }
};
