const db = require('../db');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

exports.save = async (userId, token, expiresAt) => {
  try {
    if (!userId || !token || !expiresAt) {
      logger.warn('Save refresh token - missing required parameters', { userId });
      throw AppError.badRequest('User ID, token, and expiry date are required', 'MISSING_PARAMETERS');
    }

    logger.debug('Saving refresh token', { userId });

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    );

    logger.debug('Refresh token saved successfully', { userId });
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error saving refresh token', err, { userId });
    throw AppError.internalError('Failed to save refresh token');
  }
};

exports.find = async (token) => {
  try {
    if (!token) {
      logger.warn('Find refresh token - missing token');
      throw AppError.badRequest('Token is required', 'MISSING_TOKEN');
    }

    logger.debug('Finding refresh token');

    const [[row]] = await db.query(
      `SELECT * FROM refresh_tokens WHERE token = ?`,
      [token]
    );

    if (!row) {
      logger.warn('Refresh token not found');
      return null;
    }

    logger.debug('Refresh token found', { userId: row.user_id });
    return row;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error finding refresh token', err);
    throw AppError.internalError('Failed to find refresh token');
  }
};

exports.delete = async (token) => {
  try {
    if (!token) {
      logger.warn('Delete refresh token - missing token');
      throw AppError.badRequest('Token is required', 'MISSING_TOKEN');
    }

    logger.debug('Deleting refresh token');

    await db.query(
      `DELETE FROM refresh_tokens WHERE token = ?`,
      [token]
    );

    logger.debug('Refresh token deleted successfully');
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error deleting refresh token', err);
    throw AppError.internalError('Failed to delete refresh token');
  }
};
