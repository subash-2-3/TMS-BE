const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const colors = {
  ERROR: '\x1b[31m',    // Red
  WARN: '\x1b[33m',     // Yellow
  INFO: '\x1b[36m',     // Cyan
  DEBUG: '\x1b[35m',    // Magenta
  RESET: '\x1b[0m'      // Reset
};

class Logger {
  constructor() {
    this.currentLevel = logLevels[process.env.LOG_LEVEL || 'INFO'];
    this.useConsole = process.env.LOG_CONSOLE !== 'false';
    this.useFiles = process.env.LOG_FILE !== 'false';
  }

  /**
   * Format log message with timestamp
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      logMessage += ` | ${JSON.stringify(data)}`;
    }
    
    return logMessage;
  }

  /**
   * Write to file
   */
  writeToFile(level, formattedMessage) {
    if (!this.useFiles) return;

    const timestamp = new Date();
    const fileName = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}.log`;
    const filePath = path.join(logsDir, fileName);

    fs.appendFileSync(filePath, formattedMessage + '\n', 'utf-8');
  }

  /**
   * Write to console with colors
   */
  writeToConsole(level, formattedMessage) {
    if (!this.useConsole) return;

    const coloredMessage = `${colors[level]}${formattedMessage}${colors.RESET}`;
    console.log(coloredMessage);
  }

  /**
   * Generic log function
   */
  log(level, message, data = null) {
    if (logLevels[level] > this.currentLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, data);
    
    this.writeToConsole(level, formattedMessage);
    this.writeToFile(level, formattedMessage);
  }

  /**
   * Log error
   */
  error(message, error = null, additionalData = null) {
    const data = {
      ...additionalData,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    };
    
    this.log('ERROR', message, data);
  }

  /**
   * Log warning
   */
  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  /**
   * Log info
   */
  info(message, data = null) {
    this.log('INFO', message, data);
  }

  /**
   * Log debug
   */
  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  /**
   * Log HTTP request
   */
  logRequest(method, path, userId = null) {
    const data = { method, path, userId };
    this.info('HTTP Request', data);
  }

  /**
   * Log HTTP response
   */
  logResponse(method, path, statusCode, responseTime = null) {
    const data = { method, path, statusCode, responseTimeMs: responseTime };
    this.info('HTTP Response', data);
  }
}

module.exports = new Logger();
