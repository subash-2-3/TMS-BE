const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (not disk)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to convert buffer to base64
const bufferToBase64 = (buffer) => {
  return buffer.toString('base64');
};

// Helper function to create base64 data URI
const createBase64DataURI = (buffer, mimetype) => {
  const base64 = bufferToBase64(buffer);
  return `data:${mimetype};base64,${base64}`;
};

module.exports = {
  upload,
  bufferToBase64,
  createBase64DataURI
};
