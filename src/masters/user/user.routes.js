const router = require('express').Router();
const controller = require('./user.controller');
const { authorizeRoles } = require('../../middlewares/authorize');
const { upload } = require('../../utils/imageUpload.util');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - role_id
 *               - name
 *               - email
 *               - password
 *             properties:
 *               company_id:
 *                 type: integer
 *                 example: 1
 *               role_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@test.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', authorizeRoles('Admin'), upload.single('profile_image'), controller.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users or user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *         description: Optional ID to get specific user
 *     responses:
 *       200:
 *         description: List of users or user details
 */
router.get(['/', '/:id'], authorizeRoles('Admin'), controller.getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [User]
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
 *               company_id:
 *                 type: integer
 *               role_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', authorizeRoles('Admin'), upload.single('profile_image'), controller.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate user
 *     tags: [User]
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
 *         description: User deactivated
 */
router.delete('/:id', authorizeRoles('Admin'), controller.deleteUser);

module.exports = router;
