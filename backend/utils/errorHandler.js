/**
 * Error handling utilities
 */

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle errors in Express middleware
 */
export function handleError(error, res, logger) {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;
  
  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = error.message;
  } else if (error.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service Unavailable';
    details = 'Unable to connect to external service';
  } else if (error.code === 'ETIMEDOUT') {
    statusCode = 504;
    message = 'Gateway Timeout';
    details = 'Request timeout';
  }
  
  // Log error
  logger.error('Request error', {
    message: error.message,
    statusCode,
    stack: error.stack,
    isOperational: error.isOperational || false
  });
  
  // Send error response
  const errorResponse = {
    error: message,
    message: details || message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
  
  res.status(statusCode).json(errorResponse);
}

/**
 * Async error handler wrapper
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}