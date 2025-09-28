const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
require('dotenv').config();

// Configure structured logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Grok API client
class GrokImageClient {
  constructor() {
    this.apiKey = process.env.XAI_API_KEY;
    this.baseURL = 'https://api.x.ai/v1';
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000, // 1 second base delay
      backoffMultiplier: 2
    };
    
    if (!this.apiKey) {
      logger.warn('XAI_API_KEY not configured. Image generation will fail.');
    }
  }

  async generateImages(prompt, imageCount = 1, responseFormat = 'url') {
    if (!this.apiKey) {
      throw new Error('XAI_API_KEY not configured');
    }

    // Validate inputs
    if (imageCount < 1 || imageCount > 10) {
      throw new Error('Image count must be between 1 and 10');
    }

    if (!['url', 'base64'].includes(responseFormat)) {
      throw new Error('Response format must be either "url" or "base64"');
    }

    const requestBody = {
      model: 'grok-2-image-1212',
      prompt: prompt,
      n: imageCount,
      response_format: responseFormat,
      size: '1024x1024' // Standard size for Grok
    };

    // Retry logic with exponential backoff
    let lastError;
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        logger.info('Attempting Grok image generation', {
          attempt,
          prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
          imageCount,
          responseFormat
        });

        const response = await fetch(`${this.baseURL}/images/generations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Apophenia-Backend/1.0.0'
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Grok API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
          throw new Error('Invalid response: no image data received');
        }

        // Extract URLs or base64 data based on response format
        const images = data.data.map(item => 
          responseFormat === 'url' ? item.url : item.b64_json
        );

        logger.info('Grok image generation successful', {
          imageCount: images.length,
          responseFormat,
          usage: data.usage || {}
        });

        // Log usage for monitoring
        this.logUsage(prompt, imageCount, responseFormat, data.usage);

        return images;

      } catch (error) {
        lastError = error;
        logger.warn('Grok image generation attempt failed', {
          attempt,
          error: error.message,
          willRetry: attempt < this.retryConfig.maxRetries
        });

        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  logUsage(prompt, imageCount, responseFormat, usage) {
    // Log usage for monitoring and cost tracking
    logger.info('Grok API usage', {
      service: 'grok-image-generation',
      model: 'grok-2-image-1212',
      prompt_length: prompt.length,
      image_count: imageCount,
      response_format: responseFormat,
      timestamp: new Date().toISOString(),
      usage: usage || 'not_provided'
    });
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
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
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Stricter rate limiting for image generation
const imageGenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 image requests per hour
  message: {
    error: 'Image generation rate limit exceeded, please try again later.',
    retryAfter: '1 hour'
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Initialize Grok client
const grokClient = new GrokImageClient();

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      grok: !!process.env.XAI_API_KEY
    }
  };
  
  logger.info('Health check requested', health);
  res.json(health);
});

// Image generation endpoint with validation
app.post('/api/generateImage', 
  imageGenLimiter,
  [
    body('prompt')
      .isString()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Prompt must be a string between 1 and 1000 characters'),
    body('imageCount')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Image count must be between 1 and 10'),
    body('responseFormat')
      .optional()
      .isIn(['url', 'base64'])
      .withMessage('Response format must be either "url" or "base64"')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation failed for image generation', {
        errors: errors.array(),
        body: req.body
      });
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { prompt, imageCount = 1, responseFormat = 'url' } = req.body;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      logger.info('Starting image generation', {
        requestId,
        prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
        imageCount,
        responseFormat
      });

      const images = await grokClient.generateImages(prompt, imageCount, responseFormat);

      const response = {
        success: true,
        requestId,
        images,
        metadata: {
          model: 'grok-2-image-1212',
          imageCount: images.length,
          responseFormat,
          timestamp: new Date().toISOString()
        }
      };

      logger.info('Image generation completed successfully', {
        requestId,
        imageCount: images.length,
        responseFormat
      });

      res.json(response);

    } catch (error) {
      logger.error('Image generation failed', {
        requestId,
        error: error.message,
        stack: error.stack,
        prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '')
      });

      // Return appropriate error based on the type
      if (error.message.includes('not configured')) {
        res.status(503).json({
          error: 'Service temporarily unavailable - API key not configured',
          requestId
        });
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        res.status(429).json({
          error: 'Rate limit exceeded, please try again later',
          requestId
        });
      } else if (error.message.includes('timeout')) {
        res.status(504).json({
          error: 'Request timeout - please try again',
          requestId
        });
      } else {
        res.status(500).json({
          error: 'Image generation failed',
          requestId,
          message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
      }
    }
  }
);

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handlers
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`Apophenia Grok Image Proxy server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    grokEnabled: !!process.env.XAI_API_KEY
  });
});

module.exports = app;