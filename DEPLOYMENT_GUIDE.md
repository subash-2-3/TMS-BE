# 🚀 Deployment Guide: Error Handling & Logging

This guide helps you deploy the error handling system to different environments.

## Pre-Deployment Checklist

### Development Environment ✅
- [x] Error handling implemented
- [x] Logging configured
- [x] Tests passing
- [x] Documentation complete

### Staging Environment Checklist
- [ ] Set `NODE_ENV=staging`
- [ ] Set `LOG_LEVEL=INFO`
- [ ] Configure database credentials
- [ ] Configure JWT secrets
- [ ] Set `LOG_CONSOLE=true` (for monitoring)
- [ ] Set `LOG_FILE=true` (for persistence)
- [ ] Create `/logs` directory with write permissions
- [ ] Test all error scenarios
- [ ] Monitor logs for errors
- [ ] Load test the application
- [ ] Verify graceful shutdown works

### Production Environment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Set `LOG_LEVEL=WARN` or `INFO`
- [ ] Use strong JWT secrets (32+ chars)
- [ ] Use strong database password
- [ ] Set `LOG_CONSOLE=false` (or configure log aggregation)
- [ ] Set `LOG_FILE=true` (for persistence)
- [ ] Create `/logs` directory with proper permissions
- [ ] Set up log rotation (daily)
- [ ] Set up log archival (monthly)
- [ ] Configure monitoring and alerting
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up firewall rules
- [ ] Test disaster recovery
- [ ] Create runbook for incidents

## Environment-Specific Configuration

### Development (.env)
```bash
NODE_ENV=development
LOG_LEVEL=DEBUG
LOG_CONSOLE=true
LOG_FILE=true
PORT=3000
DISABLE_AUTH=true  # For easy testing

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=dev_password
DB_NAME=tms_dev

JWT_ACCESS_SECRET=dev_secret_key
JWT_REFRESH_SECRET=dev_refresh_secret
```

### Staging (.env)
```bash
NODE_ENV=staging
LOG_LEVEL=INFO
LOG_CONSOLE=true
LOG_FILE=true
PORT=3000
DISABLE_AUTH=false

DB_HOST=staging-db.example.com
DB_USER=tms_user
DB_PASSWORD=<strong_password>
DB_NAME=tms_staging

JWT_ACCESS_SECRET=<strong_secret_32_chars>
JWT_REFRESH_SECRET=<strong_secret_32_chars>
```

### Production (.env)
```bash
NODE_ENV=production
LOG_LEVEL=WARN
LOG_CONSOLE=false
LOG_FILE=true
PORT=3000
DISABLE_AUTH=false

DB_HOST=prod-db.example.com
DB_USER=tms_user
DB_PASSWORD=<very_strong_password>
DB_NAME=tms_prod

JWT_ACCESS_SECRET=<very_strong_secret_32_chars>
JWT_REFRESH_SECRET=<very_strong_secret_32_chars>
```

## Setup Instructions

### 1. Create Directory Structure
```bash
# Create logs directory
mkdir -p /var/log/tms-backend
chmod 755 /var/log/tms-backend

# Or use application logs directory
mkdir -p ./logs
chmod 755 ./logs
```

### 2. Install Dependencies
```bash
npm install
# All required packages are already in package.json
```

### 3. Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit with environment-specific values
nano .env
```

### 4. Verify Setup
```bash
# Test logger works
npm start

# In another terminal, check logs
tail -f logs/$(date +%Y-%m-%d).log

# You should see:
# [timestamp] [INFO] Database connection pool created
# [timestamp] [INFO] Server starting on port 3000
```

### 5. Test Error Handling
```bash
# Test 401 (missing token)
curl http://localhost:3000/api/users

# Test 404 (not found)
curl http://localhost:3000/api/nonexistent

# Test validation error
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Log Management

### Log File Locations

**Development:**
```
./logs/YYYY-MM-DD.log
```

**Staging/Production:**
```
/var/log/tms-backend/YYYY-MM-DD.log
```

### Log Rotation Strategy

#### Daily Rotation
Logs rotate automatically by date. Old logs can be:

```bash
# Archive logs older than 30 days
find /var/log/tms-backend -name "*.log" -mtime +30 -exec gzip {} \;

# Delete logs older than 90 days
find /var/log/tms-backend -name "*.log.gz" -mtime +90 -delete
```

#### Automated Rotation Script
Create `/usr/local/bin/rotate-tms-logs.sh`:
```bash
#!/bin/bash
# Rotate logs
find /var/log/tms-backend -name "*.log" -mtime +7 -exec gzip {} \;
# Archive
find /var/log/tms-backend -name "*.log.gz" -mtime +30 -exec mv {} /archive/tms-backend/ \;
# Cleanup
find /var/log/tms-backend -name "*.log.gz" -mtime +90 -delete
```

Add to crontab:
```bash
# Run daily at midnight
0 0 * * * /usr/local/bin/rotate-tms-logs.sh
```

### Log Analysis

#### Common Queries
```bash
# Count errors in last hour
grep ERROR logs/$(date +%Y-%m-%d).log | wc -l

# Find specific user activity
grep '"userId": 1' logs/*.log | tail -20

# Count errors by type
grep ERROR logs/*.log | grep -o '"code": "[^"]*"' | sort | uniq -c | sort -rn

# Find slow operations
grep DEBUG logs/*.log | grep responseTime | awk '{print $NF}' | sort -rn | head -10
```

#### Log Aggregation Tools

**Option 1: ELK Stack (Elasticsearch, Logstash, Kibana)**
```bash
# Install Filebeat
apt-get install filebeat

# Configure to forward logs to Elasticsearch
cat > /etc/filebeat/filebeat.yml << EOF
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/tms-backend/*.log

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
EOF

systemctl start filebeat
```

**Option 2: Splunk**
- Configure Splunk forwarder to forward logs
- Set up Splunk dashboards for monitoring

**Option 3: DataDog**
- Install DataDog agent
- Configure to collect logs from `/var/log/tms-backend/`

**Option 4: CloudWatch (AWS)**
- Use CloudWatch Logs Agent
- Stream logs to CloudWatch

## Monitoring & Alerting

### Metrics to Monitor

1. **Error Rate**
   ```bash
   # Monitor error count per minute
   grep ERROR logs/$(date +%Y-%m-%d).log | wc -l
   ```

2. **Response Times**
   - Track slow API endpoints
   - Alert if average > 1 second

3. **Database Connectivity**
   - Monitor "Database connection error" logs
   - Alert if connection fails

4. **Authentication Failures**
   - Track failed login attempts
   - Alert if > 10 failures per minute

5. **Disk Space**
   - Monitor `/var/log/tms-backend/` size
   - Alert if > 80% full

### Alert Configuration Examples

#### Email Alert (Error rate spike)
```bash
# Check for errors and send email
ERROR_COUNT=$(grep -c "ERROR" /var/log/tms-backend/$(date +%Y-%m-%d).log)
if [ $ERROR_COUNT -gt 100 ]; then
  echo "High error rate: $ERROR_COUNT errors today" | \
    mail -s "TMS Backend Alert" admin@example.com
fi
```

#### Slack Alert
```bash
# Send to Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"TMS Backend Error: High error rate detected"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Monitoring Dashboard
Set up a dashboard showing:
- [ ] Error count (24h, 7d, 30d)
- [ ] Error rate trend
- [ ] Most common error codes
- [ ] User activity
- [ ] Database performance
- [ ] API response times
- [ ] Disk usage

## Performance Considerations

### Logging Performance

**Overhead:**
- Each log entry: < 1ms
- File write: async (non-blocking)
- Memory: < 10MB for logger instance

**Optimization Tips:**
1. **Reduce log level in production**
   ```bash
   LOG_LEVEL=WARN  # Instead of INFO
   ```

2. **Disable console logging in production**
   ```bash
   LOG_CONSOLE=false
   ```

3. **Implement log sampling for high-volume operations**
   ```javascript
   // Only log every 10th request
   if (requestCount % 10 === 0) {
     logger.debug('High volume operation', data);
   }
   ```

4. **Archive old logs regularly**
   - Keeps active log file small
   - Improves read performance

### Database Performance

**Connection Pool Settings:**
- Default: 10 connections
- Max wait time: configurable
- Adjust based on load:

```javascript
// For high concurrency
connectionLimit: 20

// For low concurrency
connectionLimit: 5
```

## Scaling Considerations

### Single Server Deployment
```
┌─────────────┐
│ Node App    │
│ Port 3000   │
└──────┬──────┘
       │
    /logs/
```

### Multi-Server Deployment with Log Centralization
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Node App #1 │  │ Node App #2 │  │ Node App #3 │
│ Port 3000   │  │ Port 3000   │  │ Port 3000   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                   ┌────▼─────┐
                   │Filebeat/ │
                   │LogStash  │
                   └────┬─────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
       ┌────▼──┐  ┌────▼──┐  ┌────▼──┐
       │  Logs │  │Splunk │  │Kibana │
       │Storage│  │/DataDog│ │/Dashboard
       └───────┘  └────────┘  └───────┘
```

### Kubernetes Deployment
```bash
# Create ConfigMap for logger
kubectl create configmap tms-logger \
  --from-literal=LOG_LEVEL=INFO \
  --from-literal=LOG_FILE=true

# Mount logs to persistent volume
# Use sidecar container to ship logs to ELK/Splunk
```

## Troubleshooting Deployment Issues

### Issue: No Logs Being Generated
**Causes:**
1. Permission denied on `/logs` directory
2. `LOG_FILE=false` in environment
3. Logger not imported in file

**Solutions:**
```bash
# Check directory permissions
ls -la logs/

# Check if file is being created
ls -la logs/$(date +%Y-%m-%d).log

# Check if logger is working
npm start  # See console output
```

### Issue: Logs Growing Too Large
**Causes:**
1. `LOG_LEVEL=DEBUG` in production
2. No log rotation
3. Old logs not being archived

**Solutions:**
```bash
# Set appropriate log level
LOG_LEVEL=WARN

# Implement log rotation
0 0 * * * find /var/log/tms-backend -name "*.log" -mtime +7 -exec gzip {} \;
```

### Issue: Error Handler Not Catching Errors
**Causes:**
1. Handler not registered in app.js
2. Handler not last middleware
3. Async handler not used in controller

**Solutions:**
```bash
# Verify app.js has error handler at end
# Verify controller uses asyncHandler
# Check error middleware is imported and registered
```

### Issue: Database Errors Not Being Logged
**Causes:**
1. Logger not imported in db.js
2. Connection pool error handler not configured

**Solutions:**
```javascript
// Verify db.js has:
db.on('error', (err) => {
  logger.error('Database error', err);
});
```

## Incident Response

### When an Error Spike Occurs

1. **Immediate Actions**
   ```bash
   # Check latest errors
   tail -50 logs/$(date +%Y-%m-%d).log | grep ERROR
   
   # Count errors by code
   grep ERROR logs/$(date +%Y-%m-%d).log | \
     grep -o '"code":"[^"]*"' | sort | uniq -c | sort -rn
   
   # Check application logs
   journalctl -u tms-backend -n 100
   ```

2. **Investigation**
   - Find error pattern
   - Identify affected resources
   - Check recent deployments
   - Check infrastructure changes

3. **Recovery**
   - Roll back if recent deployment
   - Scale up if load-related
   - Fix configuration issues
   - Restart application if needed

4. **Post-Incident**
   - Document root cause
   - Update monitoring
   - Add preventive measures
   - Update documentation

## Rollback Procedure

If deployment introduces issues:

```bash
# 1. Check current version
git describe --tags

# 2. Revert to previous version
git revert HEAD

# 3. Rebuild and restart
npm install
npm start

# 4. Verify
curl http://localhost:3000/api/docs
tail logs/$(date +%Y-%m-%d).log
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 3, 2026 | Initial implementation |

---

**Questions?** Check [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md)  
**Need help?** See [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
