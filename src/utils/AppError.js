/**
 * Custom Error Class for Application Errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null, additionalData = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.additionalData = additionalData;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response
   */
  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.errorCode || 'INTERNAL_ERROR',
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.additionalData && { details: this.additionalData })
      }
    };
  }
}

// Common error factory methods
AppError.badRequest = (message, errorCode = null, additionalData = null) => {
  return new AppError(message, 400, errorCode || 'BAD_REQUEST', additionalData);
};

AppError.unauthorized = (message = 'Unauthorized', errorCode = null) => {
  return new AppError(message, 401, errorCode || 'UNAUTHORIZED');
};

AppError.forbidden = (message = 'Forbidden', errorCode = null) => {
  return new AppError(message, 403, errorCode || 'FORBIDDEN');
};

AppError.notFound = (message, errorCode = null) => {
  return new AppError(message, 404, errorCode || 'NOT_FOUND');
};

AppError.conflict = (message, errorCode = null, additionalData = null) => {
  return new AppError(message, 409, errorCode || 'CONFLICT', additionalData);
};

AppError.unprocessable = (message, errorCode = null, additionalData = null) => {
  return new AppError(message, 422, errorCode || 'UNPROCESSABLE_ENTITY', additionalData);
};

AppError.internalError = (message = 'Internal Server Error', errorCode = null) => {
  return new AppError(message, 500, errorCode || 'INTERNAL_SERVER_ERROR');
};

AppError.serviceUnavailable = (message = 'Service Unavailable') => {
  return new AppError(message, 503, 'SERVICE_UNAVAILABLE');
};

module.exports = AppError;
