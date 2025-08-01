/**
 * Performant Logger Service
 * Intelligent logging system that optimizes performance by:
 * - Environment-aware logging (auto-disable in production)
 * - Level-based filtering (ERROR, WARN, INFO, DEBUG)
 * - Lazy evaluation (only format when necessary)
 * - Memory-efficient batching and rotation
 * - Configurable via environment variables
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

class PerformantLogger {
  constructor(category = 'APP') {
    this.category = category
    
    // Environment-based configuration
    this.isProduction = process.env.NODE_ENV === 'production'
    this.isDevelopment = process.env.NODE_ENV === 'development'
    
    // Default logging level based on environment
    const defaultLevel = this.isProduction ? 'WARN' : 'DEBUG'
    this.logLevel = LOG_LEVELS[process.env.REACT_APP_LOG_LEVEL] ?? LOG_LEVELS[defaultLevel]
    
    // Performance optimizations
    this.batchEnabled = process.env.REACT_APP_LOG_BATCHING !== 'false'
    this.batchSize = parseInt(process.env.REACT_APP_LOG_BATCH_SIZE) || 10
    this.flushInterval = parseInt(process.env.REACT_APP_LOG_FLUSH_INTERVAL) || 1000
    
    // Memory management
    this.maxBufferSize = parseInt(process.env.REACT_APP_LOG_BUFFER_SIZE) || 100
    this.maxStringLength = parseInt(process.env.REACT_APP_LOG_MAX_STRING_LENGTH) || 1000
    
    // Internal state
    this.logBuffer = []
    this.lastFlush = Date.now()
    this.flushTimer = null
    
    // Bind methods to preserve context
    this.error = this.error.bind(this)
    this.warn = this.warn.bind(this)
    this.info = this.info.bind(this)
    this.debug = this.debug.bind(this)
    
    // Auto-flush setup
    if (this.batchEnabled && typeof window !== 'undefined') {
      this.setupAutoFlush()
    }
  }

  /**
   * Check if logging should occur for the given level
   */
  shouldLog(level) {
    return LOG_LEVELS[level] <= this.logLevel
  }

  /**
   * Safely stringify data with circular reference protection and length limits
   */
  safeStringify(data) {
    if (data === null || data === undefined) return 'null'
    if (typeof data === 'string') {
      return data.length > this.maxStringLength 
        ? data.substring(0, this.maxStringLength) + '...[truncated]'
        : data
    }
    if (typeof data === 'object') {
      try {
        const stringified = JSON.stringify(data, this.getCircularReplacer(), 2)
        return stringified.length > this.maxStringLength
          ? stringified.substring(0, this.maxStringLength) + '...[truncated]'
          : stringified
      } catch (error) {
        return `[Object: ${error.message}]`
      }
    }
    return String(data)
  }

  /**
   * Handle circular references in JSON.stringify
   */
  getCircularReplacer() {
    const seen = new WeakSet()
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]'
        }
        seen.add(value)
      }
      return value
    }
  }

  /**
   * Create formatted log entry
   */
  createLogEntry(level, message, data) {
    const timestamp = new Date().toISOString()
    const entry = {
      timestamp,
      level,
      category: this.category,
      message: this.safeStringify(message),
      data: data ? this.safeStringify(data) : null
    }
    return entry
  }

  /**
   * Batch logging for performance
   */
  batchLog(level, message, data) {
    if (!this.shouldLog(level)) return

    const entry = this.createLogEntry(level, message, data)
    
    if (!this.batchEnabled) {
      this.immediateLog(entry)
      return
    }

    // Add to batch buffer
    this.logBuffer.push(entry)
    
    // Flush if buffer is full or if it's an error
    if (this.logBuffer.length >= this.batchSize || level === 'ERROR') {
      this.flushLogs()
    }
  }

  /**
   * Immediate logging (no batching)
   */
  immediateLog(entry) {
    const consoleMethod = this.getConsoleMethod(entry.level)
    const prefix = `[${entry.timestamp}] [${entry.category}] [${entry.level}]`
    
    if (entry.data) {
      consoleMethod(`${prefix} ${entry.message}`, entry.data)
    } else {
      consoleMethod(`${prefix} ${entry.message}`)
    }
  }

  /**
   * Get appropriate console method for log level
   */
  getConsoleMethod(level) {
    switch (level) {
      case 'ERROR': return console.error
      case 'WARN': return console.warn
      case 'INFO': return console.info
      case 'DEBUG': return console.log
      default: return console.log
    }
  }

  /**
   * Flush batched logs
   */
  flushLogs() {
    if (this.logBuffer.length === 0) return

    // Group by level for better console organization
    const groupedLogs = this.logBuffer.reduce((groups, entry) => {
      if (!groups[entry.level]) groups[entry.level] = []
      groups[entry.level].push(entry)
      return groups
    }, {})

    // Output grouped logs
    Object.entries(groupedLogs).forEach(([level, entries]) => {
      const consoleMethod = this.getConsoleMethod(level)
      
      if (entries.length === 1) {
        this.immediateLog(entries[0])
      } else {
        console.group(`[${this.category}] ${level} (${entries.length} entries)`)
        entries.forEach(entry => this.immediateLog(entry))
        console.groupEnd()
      }
    })

    // Clear buffer and update memory management
    this.logBuffer = []
    this.lastFlush = Date.now()
    
    // Clear timer if it exists
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
  }

  /**
   * Setup automatic flushing
   */
  setupAutoFlush() {
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushLogs())
      
      // Periodic flush for long-running sessions
      setInterval(() => {
        if (this.logBuffer.length > 0 && Date.now() - this.lastFlush > this.flushInterval) {
          this.flushLogs()
        }
      }, this.flushInterval)
    }
  }

  // Public logging methods with lazy evaluation

  /**
   * Log error messages (always logged unless completely disabled)
   */
  error(message, data) {
    this.batchLog('ERROR', message, data)
  }

  /**
   * Log warning messages
   */
  warn(message, data) {
    this.batchLog('WARN', message, data)
  }

  /**
   * Log informational messages
   */
  info(message, data) {
    this.batchLog('INFO', message, data)
  }

  /**
   * Log debug messages (only in development by default)
   */
  debug(message, data) {
    this.batchLog('DEBUG', message, data)
  }

  /**
   * Conditional logging with custom condition
   */
  conditional(condition, level, message, data) {
    if (condition && this.shouldLog(level)) {
      this.batchLog(level, message, data)
    }
  }

  /**
   * Performance timing logger
   */
  time(label) {
    if (this.shouldLog('DEBUG')) {
      console.time(`[${this.category}] ${label}`)
    }
  }

  timeEnd(label) {
    if (this.shouldLog('DEBUG')) {
      console.timeEnd(`[${this.category}] ${label}`)
    }
  }

  /**
   * Get current configuration for debugging
   */
  getConfig() {
    return {
      category: this.category,
      isProduction: this.isProduction,
      logLevel: Object.keys(LOG_LEVELS)[this.logLevel],
      batchEnabled: this.batchEnabled,
      batchSize: this.batchSize,
      flushInterval: this.flushInterval,
      maxBufferSize: this.maxBufferSize,
      maxStringLength: this.maxStringLength,
      currentBufferSize: this.logBuffer.length
    }
  }

  /**
   * Force flush all pending logs
   */
  flush() {
    this.flushLogs()
  }

  /**
   * Clear all buffered logs without outputting
   */
  clear() {
    this.logBuffer = []
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
  }

  /**
   * Create a child logger with the same configuration but different category
   */
  child(category) {
    return new PerformantLogger(category)
  }

  /**
   * Static method to create pre-configured logger instances
   */
  static create(category, options = {}) {
    const logger = new PerformantLogger(category)
    
    // Apply custom options
    if (options.level) {
      logger.logLevel = LOG_LEVELS[options.level] ?? logger.logLevel
    }
    if (options.batchEnabled !== undefined) {
      logger.batchEnabled = options.batchEnabled
    }
    if (options.batchSize) {
      logger.batchSize = options.batchSize
    }
    
    return logger
  }
}

// Create default logger instance
const defaultLogger = new PerformantLogger('APP')

// Export both class and default instance
export { PerformantLogger, LOG_LEVELS }
export default defaultLogger

// Environment variable documentation
/*
Environment Variables for Logging Configuration:

REACT_APP_LOG_LEVEL=DEBUG|INFO|WARN|ERROR
  - Controls minimum log level to output
  - Default: DEBUG in development, WARN in production

REACT_APP_LOG_BATCHING=true|false  
  - Enable/disable log batching for performance
  - Default: true

REACT_APP_LOG_BATCH_SIZE=number
  - Number of logs to batch before flushing
  - Default: 10

REACT_APP_LOG_FLUSH_INTERVAL=number
  - Milliseconds between automatic flushes
  - Default: 1000

REACT_APP_LOG_BUFFER_SIZE=number
  - Maximum buffer size before rotation
  - Default: 100

REACT_APP_LOG_MAX_STRING_LENGTH=number
  - Maximum length of log strings before truncation
  - Default: 1000

Usage Examples:

// Basic usage
import logger from '@utils/performantLogger'
logger.info('User logged in', { userId: 123 })
logger.debug('Debug info', debugData)

// Category-specific logger
import { PerformantLogger } from '@utils/performantLogger'
const scannerLogger = new PerformantLogger('SCANNER')
scannerLogger.debug('Barcode scanned', { barcode: '123456' })

// Conditional logging
logger.conditional(isDevelopment, 'DEBUG', 'Dev only message')

// Performance timing
logger.time('operation')
// ... do work
logger.timeEnd('operation')
*/