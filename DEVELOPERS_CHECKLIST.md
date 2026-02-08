# 📝 Developer's Checklist: Adding Features with Error Handling

Use this checklist when adding new features, endpoints, or services to the TMS Backend.

## Before You Start

- [ ] Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- [ ] Review [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md)
- [ ] Check existing patterns in similar files

## Creating a New Service

### Service File Structure

```javascript
const db = require('../../db');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

// Export functions with validation and error handling
exports.create = async (data) => {
  try {
    // 1. Validate input
    // 2. Log operation
    // 3. Execute database query
    // 4. Log success
    // 5. Return result
  } catch (err) {
    // Handle errors appropriately
  }
};
```

### Service Checklist

- [ ] Import logger, AppError, db
- [ ] Add validation for all inputs
- [ ] Check for null/undefined values
- [ ] Validate ID formats (isNaN check)
- [ ] Validate string lengths/formats
- [ ] Validate dates are in correct order
- [ ] Add try-catch blocks
- [ ] Log at DEBUG level before operations
- [ ] Log at INFO level after success
- [ ] Log at WARN level for validation failures
- [ ] Throw AppError with specific codes
- [ ] Handle duplicate key errors (ER_DUP_ENTRY)
- [ ] Handle not found cases explicitly
- [ ] Re-throw AppError instances
- [ ] Catch and log unexpected errors
- [ ] Return meaningful values
- [ ] Document parameters and return values

### Example Service File

```javascript
const db = require('../../db');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

/**
 * Create a new [resource]
 * @param {Object} data - The data to create
 * @returns {number} The ID of the created resource
 */
exports.create = async (data) => {
  try {
    // Validate required fields
    if (!data.name || !data.email) {
      logger.warn('Create validation failed - missing required fields', { data });
      throw AppError.badRequest('Name and email required', 'MISSING_REQUIRED_FIELDS', {
        requiredFields: ['name', 'email']
      });
    }

    logger.debug('Creating resource', { name: data.name, email: data.email });

    const [result] = await db.query(
      'INSERT INTO resources (name, email) VALUES (?, ?)',
      [data.name, data.email]
    );

    logger.info('Resource created successfully', { resourceId: result.insertId, name: data.name });
    return result.insertId;
  } catch (err) {
    // Re-throw AppError
    if (err.statusCode) throw err;

    // Handle specific database errors
    if (err.code === 'ER_DUP_ENTRY') {
      logger.warn('Duplicate email', { email: data.email });
      throw AppError.conflict('Email already exists', 'DUPLICATE_EMAIL');
    }

    // Log unexpected errors
    logger.error('Error creating resource', err, { name: data.name });
    throw AppError.internalError('Failed to create resource');
  }
};
```

## Creating a New Controller

### Controller File Structure

```javascript
const { asyncHandler } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');
const service = require('./service');

exports.create = asyncHandler(async (req, res, next) => {
  // Validation
  // Service call
  // Logging
  // Response
});
```

### Controller Checklist

- [ ] Import asyncHandler, logger, service
- [ ] Wrap all handlers in asyncHandler
- [ ] Validate request body
- [ ] Validate request params
- [ ] Call service method in try block
- [ ] Log success with relevant IDs
- [ ] Return success response with proper status code
- [ ] Don't catch errors (let asyncHandler do it)
- [ ] Include user context in logs (req.user.id)
- [ ] Use consistent response format
- [ ] Document endpoint behavior
- [ ] Include resource ID in response

### Example Controller File

```javascript
const { asyncHandler } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');
const service = require('./service');

/**
 * POST /api/resources
 */
exports.create = asyncHandler(async (req, res, next) => {
  const resource = await service.create(req.body);
  
  logger.info('Resource created via controller', {
    resourceId: resource,
    userId: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Resource created successfully',
    data: { id: resource }
  });
});

/**
 * GET /api/resources/:id
 */
exports.getById = asyncHandler(async (req, res, next) => {
  const resource = await service.getById(req.params.id);
  
  logger.info('Resource detail requested', {
    resourceId: req.params.id,
    userId: req.user.id
  });

  res.json({
    success: true,
    data: resource
  });
});
```

## Creating a New Route File

### Route File Structure

```javascript
const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../../middlewares/authorize');
const controller = require('./controller');

// Routes
router.post('/', authorizeRoles('Admin'), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', authorizeRoles('Admin'), controller.update);
router.delete('/:id', authorizeRoles('Admin'), controller.delete);

module.exports = router;
```

### Route Checklist

- [ ] Use consistent naming conventions
- [ ] Add authorization middleware where needed
- [ ] Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- [ ] Use URL parameters for resource IDs
- [ ] Use query parameters for filtering
- [ ] Document all routes

## Adding Error Codes

### When to Add New Error Codes

Add a new error code when:
- [ ] You have a new validation rule
- [ ] You have a new resource type
- [ ] You have a new business logic check
- [ ] The error is user-facing

### Error Code Naming Convention

```javascript
// Resource-specific not found
'USER_NOT_FOUND'
'PROJECT_NOT_FOUND'

// Resource-specific validation
'INVALID_USER_ID'
'INVALID_PROJECT_ID'

// Generic validation
'MISSING_REQUIRED_FIELDS'
'INVALID_DATE_RANGE'

// Resource-specific conflicts
'DUPLICATE_EMAIL'
'DUPLICATE_PROJECT_NAME'
```

### Adding to AppError Factory

```javascript
// In src/utils/AppError.js

AppError.myCustomError = (message, errorCode = null) => {
  return new AppError(message, 400, errorCode || 'MY_ERROR_CODE');
};
```

## Testing New Features

### Manual Testing Checklist

- [ ] Test success case (returns 200/201)
- [ ] Test validation errors (returns 400)
- [ ] Test not found (returns 404)
- [ ] Test duplicate/conflict (returns 409)
- [ ] Test authorization failures (returns 403)
- [ ] Test with invalid data types
- [ ] Test with null values
- [ ] Test with empty strings
- [ ] Test with negative numbers
- [ ] Test with very long strings
- [ ] Test with special characters
- [ ] Test with SQL injection attempts
- [ ] Test without authentication token
- [ ] Test with expired token
- [ ] Test with wrong role

### Testing Checklist

```bash
# Success case
curl -X POST http://localhost:3000/api/resources \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'
# Expected: 201 with success: true

# Validation error
curl -X POST http://localhost:3000/api/resources \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
# Expected: 400 with error code

# Not found
curl http://localhost:3000/api/resources/99999 \
  -H "Authorization: Bearer TOKEN"
# Expected: 404 with error code

# Duplicate
curl -X POST http://localhost:3000/api/resources \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"existing@example.com"}'
# Expected: 409 with DUPLICATE_EMAIL

# No auth
curl http://localhost:3000/api/resources/1
# Expected: 401 with TOKEN_MISSING
```

## Logging Checklist

For each endpoint/service, ensure you log:

- [ ] When validation fails (WARN level)
- [ ] When operation starts (DEBUG level)
- [ ] When operation succeeds (INFO level)
- [ ] When error occurs (ERROR level)
- [ ] User ID for authorization context
- [ ] Resource IDs for traceability
- [ ] Key operation details

### Logging Pattern

```javascript
// 1. Warn on validation failure
logger.warn('Create validation failed', { reason, data });

// 2. Debug on operation start
logger.debug('Creating resource', { field: value });

// 3. Info on success
logger.info('Resource created', { resourceId, email });

// 4. Error on failure
logger.error('Create failed', error, { email });
```

## Documentation Checklist

- [ ] Add JSDoc comments to functions
- [ ] Document parameters (type and description)
- [ ] Document return values
- [ ] Document error scenarios
- [ ] Add usage examples
- [ ] Update QUICK_REFERENCE.md if adding new pattern
- [ ] Update ERROR_HANDLING_GUIDE.md for new error codes
- [ ] Update IMPLEMENTATION_CHECKLIST.md if significant

### Example Documentation

```javascript
/**
 * Get resource by ID with validation
 * @param {number} id - The resource ID (must be positive integer)
 * @returns {Promise<Object>} The resource object
 * @throws {AppError} 400 if ID is invalid
 * @throws {AppError} 404 if resource not found
 * @throws {AppError} 500 if database error
 * 
 * @example
 * const resource = await getById(1);
 * // Returns: { id: 1, name: 'Test', ... }
 * 
 * @example
 * const resource = await getById('invalid');
 * // Throws: AppError with code INVALID_RESOURCE_ID
 */
exports.getById = async (id) => {
  // Implementation
};
```

## Code Review Checklist

When reviewing pull requests, check:

- [ ] All inputs are validated
- [ ] AppError is used for all error cases
- [ ] Logger is used appropriately
- [ ] asyncHandler wraps all async controllers
- [ ] User context is logged where applicable
- [ ] Error codes are specific and meaningful
- [ ] Response format is consistent
- [ ] Success responses include data
- [ ] Stack traces hidden in production
- [ ] No console.log statements
- [ ] No hardcoded error messages
- [ ] Try-catch in services with proper handling
- [ ] No swallowed errors
- [ ] Database errors handled specifically
- [ ] Authorization checks implemented

## Common Mistakes to Avoid

❌ **DON'T:**
```javascript
// Missing validation
exports.create = async (data) => {
  const [result] = await db.query(...);
  return result;
};

// Generic errors
throw new Error('Failed');

// Exposed sensitive info
logger.error('Failed', error);  // error might have passwords!

// Swallowed errors
try {
  await db.query(...);
} catch (err) {
  // Silently ignoring
}

// Missing context
logger.info('Created');  // What was created?

// Inconsistent responses
res.json(data);  // Sometimes success: true, sometimes not
res.json({ data });  // Format varies
```

✅ **DO:**
```javascript
// Validate first
if (!data.name) {
  throw AppError.badRequest('Name required', 'MISSING_NAME');
}

// Use AppError
throw AppError.notFound('Not found', 'RESOURCE_NOT_FOUND');

// Log without sensitive data
logger.error('Failed', error, { resourceId, operation: 'create' });

// Handle all errors
try {
  await db.query(...);
} catch (err) {
  logger.error('Query failed', err);
  throw AppError.internalError('Database error');
}

// Include context
logger.info('Resource created', { resourceId: 1, name: 'Test' });

// Consistent format
res.json({ success: true, data: result });
res.json({ success: false, error: { message, code, statusCode } });
```

## Quick Reference

### Validation Errors
```javascript
if (!input) throw AppError.badRequest('Required', 'MISSING_NAME');
if (input.length > 100) throw AppError.badRequest('Too long', 'INVALID_LENGTH');
if (!email.includes('@')) throw AppError.badRequest('Invalid', 'INVALID_EMAIL');
if (new Date(date1) > new Date(date2)) throw AppError.badRequest('Invalid', 'INVALID_RANGE');
```

### Not Found Errors
```javascript
if (!resource) throw AppError.notFound('Not found', 'RESOURCE_NOT_FOUND');
```

### Conflict Errors
```javascript
if (err.code === 'ER_DUP_ENTRY') throw AppError.conflict('Exists', 'DUPLICATE_NAME');
```

### Logging
```javascript
logger.debug('Starting', { userId });
logger.info('Success', { resourceId, userId });
logger.warn('Invalid', { email, issue });
logger.error('Failed', error, { userId, operation });
```

---

**Save this checklist and use it for every new feature!**

Need help? Check [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md)
