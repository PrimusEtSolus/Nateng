// Logger utility for consistent error handling and debugging
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    if (this.isDevelopment) {
      // Only log in development
      const logMethod = level === LogLevel.ERROR ? 'error' : 
                       level === LogLevel.WARN ? 'warn' : 
                       level === LogLevel.INFO ? 'info' : 'log'
      
      console[logMethod](`[${level.toUpperCase()}] ${message}`, context || '')
    }

    // In production, you could send logs to a service like Sentry, LogRocket, etc.
    // this.sendToLogService(logEntry)
  }

  error(message: string, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  // API-specific logging
  apiError(method: string, endpoint: string, error: any, userId?: string) {
    this.error(`API Error: ${method} ${endpoint}`, {
      error: error.message || error,
      stack: error.stack,
      userId,
      endpoint,
      method
    })
  }

  apiSuccess(method: string, endpoint: string, data?: any, userId?: string) {
    this.info(`API Success: ${method} ${endpoint}`, {
      userId,
      endpoint,
      method,
      dataSize: data ? JSON.stringify(data).length : 0
    })
  }

  // Authentication logging
  authError(action: string, error: any, email?: string) {
    this.error(`Auth Error: ${action}`, {
      error: error.message || error,
      email: email ? email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined, // Mask email
      action
    })
  }

  authSuccess(action: string, userId?: string, email?: string) {
    this.info(`Auth Success: ${action}`, {
      userId,
      email: email ? email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined, // Mask email
      action
    })
  }

  // Database operation logging
  dbError(operation: string, table: string, error: any) {
    this.error(`Database Error: ${operation} on ${table}`, {
      error: error.message || error,
      operation,
      table
    })
  }

  dbSuccess(operation: string, table: string, recordId?: any) {
    this.debug(`Database Success: ${operation} on ${table}`, {
      operation,
      table,
      recordId
    })
  }
}

export const logger = new Logger()
