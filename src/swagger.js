const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TMS API',
    version: '1.0.0',
    description: 'API documentation for Company Master',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    './src/auth/**/*.js',        // 👈 ADD THIS
    './src/masters/**/*.js',
    './src/app.js'               // 👈 OPTIONAL but good practice
  ],
};


const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
