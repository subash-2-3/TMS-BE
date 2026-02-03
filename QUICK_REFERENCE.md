# Quick Reference: Error Handling & Logging

## 🚀 Quick Start

### View Logs
```bash
# Watch real-time logs
tail -f logs/$(date +%Y-%m-%d).log

# View all errors today
grep ERROR logs/$(date +%Y-%m-%d).log
```

### Configure Logging
```bash
# .env file
LOG_LEVEL=DEBUG      # Show all logs
LOG_LEVEL=INFO       # Normal operation (default)
LOG_LEVEL=WARN       # Warnings only
LOG_LEVEL=ERROR      # Errors only
```

## 📌 Common Patterns

### Controller with Error Handling
```javascript
const { asyncHandler } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const AppError = require('./utils/AppError');

exports.getUserById = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  
  if (!userId) {
    logger.warn('Invalid user ID', { userId });
    return next(AppError.badRequest('User ID required', 'INVALID_USER_ID'));
  }

  const user = await userService.getById(userId);
  logger.info('User fetched', { userId });
  
  res.json({ success: true, data: user });
});
```

### Service with Validation
```javascript
const logger = require('./utils/logger');
const AppError = require('./utils/AppError');

exports.create = async (data) => {
  // Validate
  if (!data.name) {
    logger.warn('Create validation failed', { field: 'name' });
    throw AppError.badRequest('Name required', 'MISSING_NAME');
  }

  try {
    logger.debug('Creating record', { name: data.name });
    const result = await db.query(sql, values);
    logger.info('Record created', { id: result.insertId });
    return result.insertId;
  } catch (err) {
    if (err.statusCode) throw err;
    logger.error('Creation failed', err, { name: data.name });
    throw AppError.internalError('Failed to create record');
  }
};
```

## 🎯 Error Types Quick Reference

| Status | Type | Usage |
|--------|------|-------|
| 400 | `badRequest()` | Validation failed |
| 401 | `unauthorized()` | Auth required |
| 403 | `forbidden()` | No permission |
| 404 | `notFound()` | Resource missing |
| 409 | `conflict()` | Duplicate data |
| 500 | `internalError()` | Server error |

### Example: Each Error Type
```javascript
// 400 - Bad Request
throw AppError.badRequest('Email invalid', 'INVALID_EMAIL', { field: 'email' });

// 401 - Unauthorized
throw AppError.unauthorized('Token expired', 'TOKEN_EXPIRED');

// 403 - Forbidden
throw AppError.forbidden('Insufficient permissions', 'INSUFFICIENT_ROLE');

// 404 - Not Found
throw AppError.notFound('User not found', 'USER_NOT_FOUND');

// 409 - Conflict
throw AppError.conflict('Email exists', 'DUPLICATE_EMAIL');

// 500 - Internal Error
throw AppError.internalError('Database failed');
```

## 📊 Log Levels

| Level | Color | When to Use |
|-------|-------|------------|
| ERROR | 🔴 Red | Unexpected failures |
| WARN | 🟡 Yellow | Preventable issues |
| INFO | 🟦 Cyan | Business events |
| DEBUG | 🟪 Magenta | Development details |

```javascript
logger.error('Failed to save', error, { userId: 1 });
logger.warn('Duplicate email', { email: 'test@example.com' });
logger.info('User created', { userId: 1 });
logger.debug('Query executed', { rows: 5 });
```

## 📝 Logging Best Practices

✅ **DO:**
```javascript
logger.info('User created', { userId: 1, email: 'user@example.com' });
logger.error('Connection failed', err, { host: 'db.local' });
logger.warn('Attempt #3', { email, attempts: 3 });
```

❌ **DON'T:**
```javascript
console.log('User created');  // Use logger instead
throw new Error('Failed');    // Use AppError instead
logger.error(err);            // Include context data
```

## 🔍 Debugging Tips

### Enable Debug Logging
```bash
LOG_LEVEL=DEBUG npm start
```

### Find Issues in Logs
```bash
# Find all errors
grep "ERROR" logs/*.log

# Find specific user issues
grep "userId\":1" logs/*.log

# Find recent errors (last 50 lines)
tail -50 logs/$(date +%Y-%m-%d).log | grep ERROR

# Follow logs in real-time
tail -f logs/$(date +%Y-%m-%d).log
```

### Test Error Handling
```bash
# Missing token
curl http://localhost:3000/api/users

# Invalid JSON
curl -X POST http://localhost:3000/api/users \
  -d "invalid" \
  -H "Content-Type: application/json"

# Validation error
curl -X POST http://localhost:3000/api/users \
  -d '{}' \
  -H "Content-Type: application/json"
```

## 🔐 Security Notes

- Stack traces shown only in `NODE_ENV=development`
- Production errors: generic "something went wrong" messages
- Sensitive data (passwords) never logged
- Validation messages are safe to show users
- Rate limit consideration: don't log every invalid attempt

## 🐛 Common Issues

**No logs visible?**
- Check `LOG_LEVEL` isn't higher than your message
- Ensure `/logs` directory exists
- Verify `LOG_CONSOLE=true`

**Too many logs?**
- Increase `LOG_LEVEL` to `WARN` or `ERROR`
- Set `LOG_FILE=false` if disk space is low

**Missing error handler?**
- Wrap controller in `asyncHandler`
- Don't forget `next(err)` in catch blocks
- Error middleware must be last in `app.js`

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `src/utils/logger.js` | Logging system |
| `src/utils/AppError.js` | Error class |
| `src/middlewares/errorHandler.js` | Error middleware |
| `.env.example` | Configuration template |
| `ERROR_HANDLING_GUIDE.md` | Full documentation |
| `IMPLEMENTATION_SUMMARY.md` | What was implemented |

## 💡 Pro Tips

1. **Always include user context in logs**
   ```javascript
   logger.info('Action', { userId: req.user.id, action: 'created' });
   ```

2. **Use meaningful error codes**
   ```javascript
   // Good
   throw AppError.notFound('User not found', 'USER_NOT_FOUND');
   
   // Bad
   throw AppError.notFound('Not found', 'ERROR');
   ```

3. **Log at service layer for details**
   ```javascript
   // Services do validation and logging
   // Controllers just pass through
   ```

4. **Don't catch and ignore errors**
   ```javascript
   // Bad
   try { await db.query(...); } catch (err) { }
   
   // Good
   try { await db.query(...); } catch (err) { 
     logger.error('Query failed', err);
     throw AppError.internalError(...);
   }
   ```

5. **Use appropriate HTTP status codes**
   - 400: Client sent bad data
   - 401: Missing/invalid auth
   - 403: Has auth but no permission
   - 404: Resource doesn't exist
   - 409: Data conflict (duplicate)
   - 500: Server error

---

**For more details, see `ERROR_HANDLING_GUIDE.md`**
