const logger = require('../../utils/logger');
const { asyncHandler } = require('../../middlewares/errorHandler');
const projectService = require('./project.service');

exports.createProject = asyncHandler(async (req, res, next) => {
  try {
    const projectId = await projectService.createProject({
      ...req.body,
      company_id: req.user.company_id
    });

    logger.info('Project creation request handled', { projectId, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { id: projectId }
    });
  } catch (err) {
    next(err);
  }
});

exports.getProjects = asyncHandler(async (req, res, next) => {
  try {
    const projects = await projectService.getProjects();

    logger.info('Projects list request handled', { count: projects.length, userId: req.user.id });

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (err) {
    next(err);
  }
});

exports.getProjectById = asyncHandler(async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);

    logger.info('Project detail request handled', { projectId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      data: project
    });
  } catch (err) {
    next(err);
  }
});

exports.updateProject = asyncHandler(async (req, res, next) => {
  try {
    await projectService.updateProject(req.params.id, req.body);

    logger.info('Project update request handled', { projectId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

exports.archiveProject = asyncHandler(async (req, res, next) => {
  try {
    await projectService.archiveProject(req.params.id);

    logger.info('Project archive request handled', { projectId: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      message: 'Project archived successfully'
    });
  } catch (err) {
    next(err);
  }
});
