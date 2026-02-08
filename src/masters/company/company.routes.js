const router = require('express').Router();
const controller = require('./company.controller');
const { authorizeRoles } = require('../../middlewares/authorize');
const { upload } = require('../../utils/imageUpload.util');

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company master management
 */

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               company_logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Company created
 */
router.post('/', authorizeRoles('Admin'), upload.single('company_logo'), controller.createCompany);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies or company by ID
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Optional ID to get specific company
 *     responses:
 *       200:
 *         description: List of companies or company details
 */
router.get(['/', '/:id'], authorizeRoles('Admin'), controller.getCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               company_logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Company updated
 */
router.put('/:id', authorizeRoles('Admin'), upload.single('company_logo'), controller.updateCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Deactivate company
 *     tags: [Company]
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
 *         description: Company deactivated
 */
router.delete('/:id', authorizeRoles('Admin'), controller.deleteCompany);

module.exports = router;
