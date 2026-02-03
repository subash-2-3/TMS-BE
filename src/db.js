require('dotenv').config();

const mysql = require('mysql2/promise');
const logger = require('./utils/logger');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Log successful connection attempts
db.getConnection()
  .then((connection) => {
    logger.info('Database connection pool created successfully', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
    connection.release();
  })
  .catch((err) => {
    logger.error('Failed to create database connection pool', err, {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME
    });
  });

// Handle connection errors
db.on('error', (err) => {
  logger.error('Database connection error', err, {
    code: err.code,
    fatal: err.fatal
  });
});

module.exports = db;
