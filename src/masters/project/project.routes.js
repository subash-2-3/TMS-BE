const express = require('express');
const router = express.Router();

const projectController = require('./project.controller');
const { authorizeRoles } = require('../../middlewares/authorize');

/**
 * @swagger
 * tags:
 *   name: Project
 *   description: Project master management
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create project
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - name
 *               - start_date
 *             properties:
 *               company_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Help Desk Project
 *               description:
 *                 type: string
 *                 example: Internal help desk system
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-01
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-30
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post(
  '/',
  authorizeRoles('Admin'),
  projectController.createProject
);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get(
  '/',
  authorizeRoles('Admin'),
  projectController.getProjects
);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project details
 */
router.get(
  '/:id',
  authorizeRoles('Admin'),
  projectController.getProjectById
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Active, On Hold, Completed]
 *     responses:
 *       200:
 *         description: Project updated successfully
 */
router.put(
  '/:id',
  authorizeRoles('Admin'),
  projectController.updateProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Archive project
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project archived successfully
 */
router.delete(
  '/:id',
  authorizeRoles('Admin'),
  projectController.archiveProject
);

module.exports = router;
