/**
 * Logging service for structured logging
 * Works on both server and client side
 * Replace console.error with this service throughout the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isServer: boolean;
  private isTest: boolean;

  constructor() {
    // Check if we're on server or client
    this.isServer = typeof window === 'undefined';
    // Check if we're in test environment
    this.isTest =
      (typeof process !== 'undefined' &&
        (process.env.NODE_ENV === 'test' ||
          process.env.VITEST !== undefined)) ||
      false;
    // Get NODE_ENV safely for both server and client
    if (this.isServer) {
      this.isDevelopment = process.env.NODE_ENV === 'development';
    } else {
      // Client-side: check hostname or use a safe default
      this.isDevelopment =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (this.isTest) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // In production, you might want to send to a logging service (e.g., Sentry, LogRocket)
    // For now, we'll use console with structured output
    if (this.isDevelopment) {
      const consoleMethod =
        level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](JSON.stringify(logEntry, null, 2));
    } else {
      // In production, format for log aggregation services
      const consoleMethod =
        level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](JSON.stringify(logEntry));
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext: LogContext = {
      ...context,
    };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    } else if (error) {
      errorContext.error = error;
    }

    this.log('error', message, errorContext);
  }
}

export const logger = new Logger();
