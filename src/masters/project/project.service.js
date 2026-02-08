const db = require('../../db');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

/**
 * Create project
 */
exports.createProject = async (data) => {
  try {
    if (!data.company_id || !data.name) {
      logger.warn('Create project validation failed - missing required fields', { data });
      throw AppError.badRequest('Company ID and Name are required', 'MISSING_REQUIRED_FIELDS', {
        requiredFields: ['company_id', 'name']
      });
    }

    if (data.start_date && data.end_date) {
      if (new Date(data.start_date) > new Date(data.end_date)) {
        logger.warn('Create project validation failed - invalid date range', { data });
        throw AppError.badRequest('Start date must be before end date', 'INVALID_DATE_RANGE');
      }
    }

    logger.debug('Creating project', { company_id: data.company_id, name: data.name });

    const [result] = await db.query(
      `
      INSERT INTO projects
        (company_id, name, description, start_date, end_date)
      VALUES
        (?, ?, ?, ?, ?)
      `,
      [
        data.company_id,
        data.name,
        data.description || null,
        data.start_date,
        data.end_date || null
      ]
    );

    logger.info('Project created successfully', { projectId: result.insertId, company_id: data.company_id });
    return result.insertId;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error creating project', err, { data });
    throw AppError.internalError('Failed to create project');
  }
};

/**
 * Get all projects
 */
exports.getProjects = async () => {
  try {
    logger.debug('Fetching all projects');

    const [rows] = await db.query(
      `SELECT * FROM projects WHERE status != 'Completed'`
    );

    logger.info('Projects fetched successfully', { count: rows.length });
    return rows;
  } catch (err) {
    logger.error('Error fetching projects', err);
    throw AppError.internalError('Failed to fetch projects');
  }
};

/**
 * Get project by ID
 */
exports.getProjectById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid project ID provided', { id });
      throw AppError.badRequest('Valid project ID is required', 'INVALID_PROJECT_ID');
    }

    logger.debug('Fetching project by ID', { projectId: id });

    const [[row]] = await db.query(
      `SELECT * FROM projects WHERE id = ?`,
      [id]
    );

    if (!row) {
      logger.warn('Project not found', { projectId: id });
      throw AppError.notFound(`Project with ID ${id} not found`, 'PROJECT_NOT_FOUND');
    }

    logger.debug('Project fetched successfully', { projectId: id });
    return row;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error fetching project by ID', err, { id });
    throw AppError.internalError('Failed to fetch project');
  }
};

/**
 * Update project
 */
exports.updateProject = async (id, data) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid project ID for update', { id });
      throw AppError.badRequest('Valid project ID is required', 'INVALID_PROJECT_ID');
    }

    // Check if project exists
    const project = await this.getProjectById(id);
    if (!project) {
      throw AppError.notFound(`Project with ID ${id} not found`, 'PROJECT_NOT_FOUND');
    }

    // Validate dates if provided
    if (data.start_date && data.end_date) {
      if (new Date(data.start_date) > new Date(data.end_date)) {
        logger.warn('Update project validation failed - invalid date range', { id, data });
        throw AppError.badRequest('Start date must be before end date', 'INVALID_DATE_RANGE');
      }
    }

    logger.debug('Updating project', { projectId: id, updatedFields: Object.keys(data) });

    await db.query(
      `UPDATE projects SET ? WHERE id = ?`,
      [data, id]
    );

    logger.info('Project updated successfully', { projectId: id });
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error updating project', err, { id, data });
    throw AppError.internalError('Failed to update project');
  }
};

/**
 * Archive project (soft delete)
 */
exports.archiveProject = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid project ID for archive', { id });
      throw AppError.badRequest('Valid project ID is required', 'INVALID_PROJECT_ID');
    }

    // Check if project exists
    const project = await this.getProjectById(id);
    if (!project) {
      throw AppError.notFound(`Project with ID ${id} not found`, 'PROJECT_NOT_FOUND');
    }

    logger.debug('Archiving project', { projectId: id });

    await db.query(
      `UPDATE projects SET status = 'Completed' WHERE id = ?`,
      [id]
    );

    logger.info('Project archived successfully', { projectId: id });
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error archiving project', err, { id });
    throw AppError.internalError('Failed to archive project');
  }
};
