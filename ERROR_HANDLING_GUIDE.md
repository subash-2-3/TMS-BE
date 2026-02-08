# Error Handling & Logging Documentation

## Overview
This document outlines the comprehensive error handling and logging system implemented across the TMS Backend application.

## Architecture

### 1. Logger Utility (`src/utils/logger.js`)
Central logging system with multiple levels and outputs.

**Features:**
- Four log levels: `ERROR`, `WARN`, `INFO`, `DEBUG`
- Console output with color-coded messages
- File-based logging with daily rotation
- Structured logging with contextual data
- Configurable via environment variables

**Log Levels:**
```
ERROR (0) - Critical errors that need immediate attention
WARN  (1) - Warning messages for potentially problematic situations
INFO  (2) - General informational messages
DEBUG (3) - Detailed debug information
```

**Usage:**
```javascript
const logger = require('./utils/logger');

logger.error('Error message', error, { additionalData });
logger.warn('Warning message', { contextData });
logger.info('Info message', { contextData });
logger.debug('Debug message', { contextData });
logger.logRequest(method, path, userId);
logger.logResponse(method, path, statusCode, responseTime);
```

**Environment Variables:**
```
LOG_LEVEL=INFO          # Default log level (ERROR, WARN, INFO, DEBUG)
LOG_CONSOLE=true        # Enable console output
LOG_FILE=true           # Enable file logging
NODE_ENV=development    # Include stack traces in development
```

**Log Files:**
- Location: `/logs/YYYY-MM-DD.log`
- Format: `[ISO_TIMESTAMP] [LEVEL] MESSAGE | {JSON_DATA}`
- Daily rotation based on date

### 2. Custom Error Class (`src/utils/AppError.js`)
Standardized error responses with HTTP status codes.

**Features:**
- Consistent error response format
- Built-in HTTP status codes
- Error code for client identification
- Additional context data
- JSON serialization

**Usage:**
```javascript
const AppError = require('./utils/AppError');

// Throw specific error types
throw AppError.badRequest('Invalid email format', 'INVALID_EMAIL', { field: 'email' });
throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
throw AppError.forbidden('Insufficient permissions', 'INSUFFICIENT_ROLE');
throw AppError.notFound('User not found', 'USER_NOT_FOUND');
throw AppError.conflict('Email already exists', 'DUPLICATE_EMAIL');
throw AppError.internalError('Database error occurred');
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2026-02-03T10:00:00.000Z",
    "details": { /* additional context */ }
  }
}
```

### 3. Error Handler Middleware (`src/middlewares/errorHandler.js`)
Centralized error handling for all requests.

**Features:**
- Catches all errors from routes and services
- Logs errors with full context
- Formats consistent error responses
- Includes stack traces in development mode
- 404 handler for undefined routes

**Components:**

**errorHandler** - Express error handling middleware
```javascript
app.use(errorHandler); // Must be registered last
```

**asyncHandler** - Wrapper for async route handlers
```javascript
const { asyncHandler } = require('./middlewares/errorHandler');

exports.createUser = asyncHandler(async (req, res, next) => {
  // Your async code here
  // Errors automatically caught and passed to errorHandler
});
```

### 4. Request Logging Middleware
Automatic logging of all HTTP requests and responses.

**Logged Information:**
- HTTP method and path
- User ID (if authenticated)
- Response status code
- Response time in milliseconds
- IP address
- User Agent

## Implementation Patterns

### Controllers
All controllers use the `asyncHandler` wrapper:
```javascript
exports.createUser = asyncHandler(async (req, res, next) => {
  try {
    const result = await service.create(req.body);
    logger.info('User created', { userId: result.id });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err); // Passed to errorHandler
  }
});
```

### Services
Services validate input and throw AppError instances:
```javascript
exports.create = async (data) => {
  try {
    // Validation
    if (!data.email) {
      logger.warn('Create user - missing email');
      throw AppError.badRequest('Email is required', 'MISSING_EMAIL');
    }

    // Database operation
    logger.debug('Creating user', { email: data.email });
    const [result] = await db.query(sql, values);
    
    logger.info('User created successfully', { userId: result.insertId });
    return result.insertId;
  } catch (err) {
    if (err.statusCode) throw err; // Re-throw AppError
    
    // Handle specific database errors
    if (err.code === 'ER_DUP_ENTRY') {
      logger.warn('Duplicate email', { email: data.email });
      throw AppError.conflict('Email already exists', 'DUPLICATE_EMAIL');
    }

    // Log unexpected errors
    logger.error('Error creating user', err, { email: data.email });
    throw AppError.internalError('Failed to create user');
  }
};
```

### Authentication Middleware
Enhanced error handling with specific error codes:
```javascript
// auth.js middleware
const token = authHeader.split(' ')[1];

try {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  req.user = decoded;
  next();
} catch (err) {
  logger.warn('Token verification failed', { error: err.message });
  
  if (err.name === 'TokenExpiredError') {
    return next(AppError.unauthorized('Token expired', 'TOKEN_EXPIRED'));
  }
  
  return next(AppError.unauthorized('Invalid token', 'INVALID_TOKEN'));
}
```

## Error Codes Reference

### Authentication Errors (401)
- `UNAUTHORIZED` - User not authenticated
- `TOKEN_MISSING` - No authorization token provided
- `INVALID_TOKEN_FORMAT` - Malformed authorization header
- `INVALID_TOKEN` - Token verification failed
- `TOKEN_EXPIRED` - JWT token has expired
- `INVALID_CREDENTIALS` - Login failed

### Authorization Errors (403)
- `INSUFFICIENT_ROLE` - User lacks required role

### Validation Errors (400)
- `BAD_REQUEST` - Invalid request
- `MISSING_CREDENTIALS` - Missing email or password
- `INVALID_EMAIL` - Email format invalid
- `MISSING_REQUIRED_FIELDS` - Required fields missing
- `INVALID_DATE_RANGE` - Date validation failed
- `INVALID_[RESOURCE]_ID` - Invalid resource ID

### Resource Errors (404, 409)
- `NOT_FOUND` - Resource not found
- `DUPLICATE_EMAIL` - Email already registered
- `DUPLICATE_NAME` - Name already exists

### Server Errors (500)
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `FAILED_TO_[OPERATION]` - Specific operation failed

## Configuration

### Environment Variables
Add to `.env` file:
```bash
# Logging
LOG_LEVEL=INFO
LOG_CONSOLE=true
LOG_FILE=true

# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=tms

# JWT
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
```

## Log File Structure

Logs are stored in `/logs/YYYY-MM-DD.log` with format:
```
[2026-02-03T10:30:45.123Z] [INFO] User created successfully | {"userId":1,"email":"user@example.com"}
[2026-02-03T10:30:46.456Z] [ERROR] Database connection error | {"error":{"message":"Connection timeout","name":"Error"},"host":"localhost"}
[2026-02-03T10:30:47.789Z] [WARN] Missing authentication token | {"path":"/api/users","ip":"127.0.0.1"}
[2026-02-03T10:30:48.012Z] [DEBUG] Fetching user by ID | {"userId":1}
```

## Best Practices

1. **Always Log Actions**: Log create, update, delete operations with user IDs
2. **Include Context**: Add relevant IDs, emails, paths to logs
3. **Use Appropriate Levels**:
   - `ERROR` - Unexpected failures
   - `WARN` - Preventable issues
   - `INFO` - Key business events
   - `DEBUG` - Development details
4. **Validate Early**: Validate in controllers/middlewares before reaching services
5. **Fail Fast**: Throw errors immediately with clear messages
6. **Don't Expose Internals**: Never send stack traces to clients in production
7. **Audit Trail**: Log security-relevant events (login, role changes, deletions)

## Troubleshooting

### No logs appearing
1. Check `LOG_CONSOLE` and `LOG_FILE` settings
2. Verify `LOG_LEVEL` is not higher than your message level
3. Ensure `/logs` directory exists (auto-created)

### Too many logs
1. Increase `LOG_LEVEL` to `WARN` or `ERROR`
2. Use `LOG_FILE=false` to disable file logging

### Missing logs in files
1. Check file permissions on `/logs` directory
2. Verify disk space availability
3. Check `NODE_ENV` setting for appropriate handling

## Testing Error Handling

Test endpoints to verify error handling:
```bash
# Test 404
curl http://localhost:3000/api/nonexistent

# Test invalid JSON
curl -X POST http://localhost:3000/api/users -d "invalid" -H "Content-Type: application/json"

# Test validation errors
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{}"

# Test auth errors
curl http://localhost:3000/api/projects

# Test with token
curl -H "Authorization: Bearer invalid_token" http://localhost:3000/api/projects
```

## Future Enhancements

Potential improvements for logging:
1. Rotate logs monthly instead of daily
2. Add log compression for archived files
3. Integrate with external logging services (Winston transports)
4. Add correlation IDs for request tracing
5. Implement log aggregation dashboard
6. Add performance metrics collection
7. Add database query logging for slow queries
