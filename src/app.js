const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const logger = require('./utils/logger');
const swaggerSpec = require('./swagger');
const authMiddleware = require('./middlewares/auth');
const { errorHandler, asyncHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./auth/auth.routes');

const companyRoutes = require('./masters/company/company.routes');
const roleRoutes = require('./masters/role/role.routes');
const userRoutes = require('./masters/user/user.routes');
const projectRoutes = require('./masters/project/project.routes');

const app = express();

/* ---------- Middlewares ---------- */
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  logger.logRequest(req.method, req.path, req.user?.id || null);
  next();
});

// const jwt = require('jsonwebtoken');

// app.get('/test-token', (req, res) => {
//   const token = jwt.sign(
//     {
//       id: 1,
//       role: 'Admin'
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: '1h' }
//   );

//   res.json({ token });
// });


/* ---------- Swagger Docs ---------- */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ---------- Routes ---------- */

/* Auth */
app.use('/api/auth', authRoutes);

/* Master */
app.use('/api/companies', authMiddleware, companyRoutes);
app.use('/api/roles', authMiddleware, roleRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/projects',authMiddleware, projectRoutes);

/* ---------- Health Check ---------- */
app.get('/', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.send('API is running...');
});

// 404 handler
app.use((req, res) => {
  logger.warn('404 Not Found', { method: req.method, path: req.path });
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString()
    }
  });
});

/* ---------- Error Handler (must be last) ---------- */
app.use(errorHandler);

/* ---------- Server ---------- */
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server starting on port ${PORT}`, { port: PORT, env: process.env.NODE_ENV });
  logger.info(`Swagger docs available at http://localhost:${PORT}/api/docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at Promise', reason, { promise });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
