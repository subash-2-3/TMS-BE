const router = require('express').Router();
const controller = require('./role.controller');
const { authorizeRoles } = require('../../middlewares/authorize');

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role master management
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a role
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Admin
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created
 */
router.post('/', authorizeRoles('Admin'), controller.createRole);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 */
router.get('/', authorizeRoles('Admin'), controller.getRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Role]
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
 *         description: Role details
 */
router.get('/:id', authorizeRoles('Admin'), controller.getRoleById);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [Role]
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
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put('/:id', authorizeRoles('Admin'), controller.updateRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Deactivate role
 *     tags: [Role]
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
 *         description: Role deactivated
 */
router.delete('/:id', authorizeRoles('Admin'), controller.deleteRole);

module.exports = router;
