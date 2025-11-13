/**
 * Logger Service
 *
 * Simple logging service for consistent logging across the application.
 * Can be extended to support different log levels, remote logging, etc.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private currentLevel: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.currentLevel <= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.currentLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (this.currentLevel <= LogLevel.ERROR) {
      if (error instanceof Error) {
        console.error(`[ERROR] ${message}`, error.message, error.stack, ...args);
      } else if (error) {
        console.error(`[ERROR] ${message}`, error, ...args);
      } else {
        console.error(`[ERROR] ${message}`, ...args);
      }
    }
  }

  /**
   * Log flow transitions
   */
  flow(flowName: string, message: string, ...args: unknown[]): void {
    this.info(`🔄 [${flowName}] ${message}`, ...args);
  }

  /**
   * Log engine execution
   */
  engine(engineName: string, message: string, ...args: unknown[]): void {
    this.debug(`⚙️  [${engineName}] ${message}`, ...args);
  }

  /**
   * Log command execution
   */
  command(commandType: string, message: string, ...args: unknown[]): void {
    this.debug(`🎯 [${commandType}] ${message}`, ...args);
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

// Set default log level based on environment
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  logger.setLevel(LogLevel.DEBUG);
} else {
  logger.setLevel(LogLevel.INFO);
}
