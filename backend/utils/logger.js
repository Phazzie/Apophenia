/**
 * Structured logging utility using Winston
 */

import winston from 'winston';

/**
 * Create a configured Winston logger instance
 */
function createLogger() {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const logFormat = process.env.LOG_FORMAT || 'json';
  
  // Define log format
  const formats = [
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ];
  
  if (logFormat === 'json') {
    formats.push(winston.format.json());
  } else {
    formats.push(winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length) {
          log += ` ${JSON.stringify(meta)}`;
        }
        return log;
      })
    ));
  }
  
  const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(...formats),
    defaultMeta: { 
      service: 'apophenia-backend',
      version: process.env.npm_package_version || '1.0.0'
    },
    transports: [
      new winston.transports.Console(),
      // Add file transport for production
      ...(process.env.NODE_ENV === 'production' ? [
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ] : [])
    ]
  });
  
  return logger;
}

export { createLogger };