const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const swaggerSpec = require('./swagger');
const authMiddleware = require('./middlewares/auth');
const companyRoutes = require('./masters/company/company.routes');
const roleRoutes = require('./masters/role/role.routes');

const userRoutes = require('./masters/user/user.routes');
const authRoutes = require('./auth/auth.routes');

const app = express();

/* ---------- Middlewares ---------- */
app.use(cors());
app.use(express.json());

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

/* ---------- Health Check ---------- */
app.get('/', (req, res) => {
  res.send('API is running...');
});

/* ---------- Server ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📘 Swagger docs at http://localhost:${PORT}/api/docs`);
});
