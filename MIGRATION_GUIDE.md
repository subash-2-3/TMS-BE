# Migration Guide: Old Code → New Error Handling

This guide helps developers understand how the error handling system changed and how to work with it.

## Overview of Changes

### Before (Old Pattern)
```javascript
// Controllers had try-catch blocks
exports.createUser = async (req, res) => {
  try {
    const id = await service.create(req.body);
    res.status(201).json({ message: 'User created', id });
  } catch (err) {
    res.status(500).json({ message: err.message });  // Inconsistent
  }
};

// No logging
// Generic error messages
// No error codes
// Stack traces exposed to clients
```

### After (New Pattern)
```javascript
// Controllers are clean and focused
const { asyncHandler } = require('./middlewares/errorHandler');

exports.createUser = asyncHandler(async (req, res, next) => {
  const id = await service.create(req.body);
  logger.info('User created', { userId: id });
  res.status(201).json({
    success: true,
    data: { id }
  });
});

// Errors automatically caught and handled
// Comprehensive logging
// Specific error codes
// Production-safe responses
```

## Key Differences

### 1. Response Format

**Old:**
```json
{
  "message": "User created",
  "id": 1
}
```

**New:**
```json
{
  "success": true,
  "data": {
    "id": 1
  }
}
```

**Error - Old:**
```json
{
  "message": "some unexpected error message"
}
```

**Error - New:**
```json
{
  "success": false,
  "error": {
    "message": "Email already exists",
    "code": "DUPLICATE_EMAIL",
    "statusCode": 409,
    "timestamp": "2026-02-03T10:00:00.000Z"
  }
}
```

### 2. Error Throwing

**Old:**
```javascript
// Services returned error objects or threw generic errors
return null;  // Unclear what happened
throw new Error('Something failed');  // No context
```

**New:**
```javascript
// Services throw AppError with specific codes
throw AppError.notFound('User not found', 'USER_NOT_FOUND');
throw AppError.badRequest('Email invalid', 'INVALID_EMAIL', { field: 'email' });
throw AppError.conflict('Email exists', 'DUPLICATE_EMAIL');
```

### 3. Validation

**Old:**
```javascript
// Scattered validation
if (!email) return res.status(400).json({ message: 'Email required' });
if (!password) return res.status(400).json({ message: 'Password required' });

// No clear pattern
```

**New:**
```javascript
// Consistent validation with logging
if (!email || !password) {
  logger.warn('Login - missing credentials', { email });
  return next(AppError.badRequest('Email and password required', 'MISSING_CREDENTIALS'));
}
```

### 4. Logging

**Old:**
```javascript
// Minimal or no logging
console.log('User created');  // Just console
// No structured data
```

**New:**
```javascript
// Comprehensive logging at all levels
logger.info('User created', { userId: 1, email: 'user@example.com' });
logger.warn('Invalid attempt', { attempts: 3, email: 'user@example.com' });
logger.error('Database failed', error, { userId: 1, operation: 'create' });
logger.debug('Query executed', { rows: 5, timeMs: 120 });
```

## Migration Steps for Existing Code

### Step 1: Import Required Modules

```javascript
// At the top of your file
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middlewares/errorHandler');
```

### Step 2: Update Controllers

**Before:**
```javascript
exports.getUser = async (req, res) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**After:**
```javascript
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await userService.getById(req.params.id);
  logger.info('User fetched', { userId: req.params.id, requestUserId: req.user.id });
  res.json({
    success: true,
    data: user
  });
});
```

### Step 3: Update Services

**Before:**
```javascript
exports.getById = async (id) => {
  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return user;  // Returns undefined if not found
};
```

**After:**
```javascript
exports.getById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid user ID', { id });
      throw AppError.badRequest('Valid ID required', 'INVALID_USER_ID');
    }

    const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      logger.warn('User not found', { userId: id });
      throw AppError.notFound(`User ${id} not found`, 'USER_NOT_FOUND');
    }

    return user;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error fetching user', err, { id });
    throw AppError.internalError('Failed to fetch user');
  }
};
```

### Step 4: Add Validation Logging

**Before:**
```javascript
if (!email) throw new Error('Email required');
```

**After:**
```javascript
if (!email) {
  logger.warn('Validation failed - missing email');
  throw AppError.badRequest('Email is required', 'MISSING_EMAIL');
}
```

### Step 5: Update Error Messages

**Before:**
```javascript
throw new Error('User not found');
```

**After:**
```javascript
logger.warn('User not found', { userId: id });
throw AppError.notFound('User not found', 'USER_NOT_FOUND');
```

## Common Patterns

### Pattern 1: Create Resource

**Old:**
```javascript
exports.create = async (data) => {
  const [result] = await db.query('INSERT INTO users ...', values);
  return result.insertId;
};
```

**New:**
```javascript
exports.create = async (data) => {
  try {
    // Validate
    if (!data.email) {
      logger.warn('Create user - missing email');
      throw AppError.badRequest('Email required', 'MISSING_EMAIL');
    }

    logger.debug('Creating user', { email: data.email });

    // Execute
    const [result] = await db.query('INSERT INTO users ...', values);

    logger.info('User created', { userId: result.insertId, email: data.email });
    return result.insertId;
  } catch (err) {
    if (err.statusCode) throw err;

    if (err.code === 'ER_DUP_ENTRY') {
      logger.warn('Duplicate email', { email: data.email });
      throw AppError.conflict('Email exists', 'DUPLICATE_EMAIL');
    }

    logger.error('Error creating user', err, { email: data.email });
    throw AppError.internalError('Failed to create user');
  }
};
```

### Pattern 2: Fetch Resource

**Old:**
```javascript
exports.getById = async (id) => {
  const [[row]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return row;
};
```

**New:**
```javascript
exports.getById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid user ID', { id });
      throw AppError.badRequest('Valid ID required', 'INVALID_USER_ID');
    }

    logger.debug('Fetching user', { userId: id });

    const [[row]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (!row) {
      logger.warn('User not found', { userId: id });
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    return row;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error fetching user', err, { id });
    throw AppError.internalError('Failed to fetch user');
  }
};
```

### Pattern 3: Update Resource

**Old:**
```javascript
exports.update = async (id, data) => {
  await db.query('UPDATE users SET ? WHERE id = ?', [data, id]);
};
```

**New:**
```javascript
exports.update = async (id, data) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid user ID for update', { id });
      throw AppError.badRequest('Valid ID required', 'INVALID_USER_ID');
    }

    logger.debug('Updating user', { userId: id, fields: Object.keys(data) });

    await db.query('UPDATE users SET ? WHERE id = ?', [data, id]);

    logger.info('User updated', { userId: id });
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error updating user', err, { id });
    throw AppError.internalError('Failed to update user');
  }
};
```

### Pattern 4: Delete Resource

**Old:**
```javascript
exports.delete = async (id) => {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
};
```

**New:**
```javascript
exports.softDelete = async (id) => {
  try {
    if (!id || isNaN(id)) {
      logger.warn('Invalid user ID for delete', { id });
      throw AppError.badRequest('Valid ID required', 'INVALID_USER_ID');
    }

    logger.debug('Deleting user', { userId: id });

    await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);

    logger.info('User deleted', { userId: id });
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Error deleting user', err, { id });
    throw AppError.internalError('Failed to delete user');
  }
};
```

## Testing Your Changes

### Test Success Case
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "securepass123",
    "company_id": 1,
    "role_id": 1
  }'

# Expected: 201 with success: true
```

### Test Validation Error
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "John"}'

# Expected: 400 with MISSING_REQUIRED_FIELDS error code
```

### Test Not Found
```bash
curl -X GET http://localhost:3000/api/users/99999 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 404 with USER_NOT_FOUND error code
```

### Test Duplicate
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Duplicate",
    "email": "existing@example.com",
    "password": "securepass123",
    "company_id": 1,
    "role_id": 1
  }'

# Expected: 409 with DUPLICATE_EMAIL error code
```

## Troubleshooting Migration

### "AppError is not a function"
```javascript
// Make sure you import it
const AppError = require('../utils/AppError');
```

### "asyncHandler is not defined"
```javascript
// Make sure you import it
const { asyncHandler } = require('../middlewares/errorHandler');
// Or
const { asyncHandler } = require('../../middlewares/errorHandler');
```

### "Logger not logging"
```javascript
// Check LOG_LEVEL in .env
LOG_LEVEL=DEBUG  # Or INFO

// Verify logger import
const logger = require('../utils/logger');
// or relative path
const logger = require('../../utils/logger');
```

### Error not caught
```javascript
// Wrap in asyncHandler
exports.myRoute = asyncHandler(async (req, res, next) => {
  // errors are auto-caught
});

// OR manually call next with error
} catch (err) {
  next(err);
}
```

## Checklist for Each File

- [ ] Import logger, AppError, asyncHandler
- [ ] Remove try-catch from top-level controller
- [ ] Wrap controller in asyncHandler
- [ ] Update success response format with `success: true`
- [ ] Remove generic error responses
- [ ] Add input validation with AppError
- [ ] Add logging at key points
- [ ] Update service error handling
- [ ] Test all error scenarios
- [ ] Verify logs are written to `/logs` directory

---

**Need help?** Refer to `ERROR_HANDLING_GUIDE.md` for detailed examples.
