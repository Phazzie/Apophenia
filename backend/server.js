/**
 * Apophenia Backend API Server
 * 
 * Provides secure Grok image proxy with rate limiting, validation, and comprehensive logging.
 * Supports xAI Grok-2-image-1212 model integration.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import crypto from 'node:crypto';

// Import services
import GrokImageService from './services/grokImageService.js';
import { createLogger } from './utils/logger.js';
import { handleError } from './utils/errorHandler.js';

// Initialize logger
const logger = createLogger();

// Initialize services - allow injection for testing
let grokImageService = new GrokImageService(process.env.XAI_API_KEY, logger);


const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.XAI_API_KEY || 'development-csrf-secret';

function signCsrfPayload(payload) {
  return crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('base64url');
}

function createCsrfToken() {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('base64url');
  const payload = `${timestamp}.${nonce}`;
  return `${payload}.${signCsrfPayload(payload)}`;
}

function validateCsrfToken(token) {
  if (typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [timestamp, nonce, signature] = parts;
  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > CSRF_TOKEN_TTL_MS) {
    return false;
  }

  const payload = `${timestamp}.${nonce}`;
  const expectedSignature = signCsrfPayload(payload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

function csrfProtection(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const token = req.get(CSRF_HEADER_NAME);
  if (!validateCsrfToken(token)) {
    logger.warn('CSRF validation failed', {
      method: req.method,
      path: req.path,
      ip: req.ip
    });

    return res.status(403).json({
      error: 'Forbidden',
      message: 'Valid CSRF token required for state-changing API requests'
    });
  }

  return next();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Global error handlers
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', { reason });
});

// Rate limiting configuration
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path
    });
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', CSRF_HEADER_NAME]
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api', rateLimiter);

app.get('/api/csrf-token', (_req, res) => {
  res.json({
    csrfToken: createCsrfToken(),
    headerName: CSRF_HEADER_NAME,
    expiresInSeconds: CSRF_TOKEN_TTL_MS / 1000
  });
});

app.use('/api', csrfProtection);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      grok: grokImageService.isConfigured()
    }
  };
  
  logger.info('Health check requested', healthStatus);
  res.json(healthStatus);
});

// Input validation schemas
const generateImageSchema = Joi.object({
  prompt: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Prompt must be at least 10 characters long',
      'string.max': 'Prompt cannot exceed 1000 characters',
      'any.required': 'Prompt is required'
    }),
  imageCount: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .default(4)
    .messages({
      'number.min': 'Image count must be at least 1',
      'number.max': 'Image count cannot exceed 10',
      'number.integer': 'Image count must be a whole number'
    }),
  responseFormat: Joi.string()
    .valid('url', 'base64')
    .default('url')
    .messages({
      'any.only': 'Response format must be either "url" or "base64"'
    })
});

// Grok image generation endpoint
app.post('/api/generateImage', async (req, res, next) => {
  try {
    const startTime = Date.now();
    
    // Validate request body
    const { error, value: validatedData } = generateImageSchema.validate(req.body);
    
    if (error) {
      logger.warn('Request validation failed', {
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        requestBody: req.body
      });
      
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request parameters',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { prompt, imageCount, responseFormat } = validatedData;
    
    logger.info('Image generation request received', {
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      imageCount,
      responseFormat,
      requestId: req.ip + '_' + startTime
    });

    // Generate images using Grok service
    const result = await grokImageService.generateImages(prompt, imageCount, responseFormat);
    
    const duration = Date.now() - startTime;
    
    logger.info('Image generation completed', {
      success: true,
      imageCount: result?.images?.length || 0,
      responseFormat,
      duration: `${duration}ms`,
      usage: result?.usage
    });

    res.json({
      success: true,
      images: result?.images || [],
      metadata: {
        prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
        imageCount: result?.images?.length || 0,
        responseFormat,
        generatedAt: new Date().toISOString(),
        duration: `${duration}ms`
      },
      usage: result?.usage
    });
    
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.use((req, res) => {
  logger.warn('Endpoint not found', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.url} not found`,
    availableEndpoints: [
      'GET /health',
      'GET /api/csrf-token',
      'POST /api/generateImage'
    ]
  });
});

// Global error handler
app.use((error, req, res, _next) => {
  handleError(error, res, logger);
});

// Start server
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    grokConfigured: grokImageService.isConfigured()
  });
  
  if (!grokImageService.isConfigured()) {
    logger.warn('XAI_API_KEY not configured - image generation will fail');
  }
});

export default app;