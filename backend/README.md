# Apophenia Backend - Grok Image Proxy

A secure Express.js backend API server that provides Grok image generation capabilities for the Apophenia interactive narrative game. This proxy keeps API keys secure on the server side and provides rate limiting, structured logging, and comprehensive error handling.

## Features

- 🔐 **Secure API Key Management** - All xAI API keys stay on server side
- 🚀 **Grok-2-image-1212 Integration** - Latest xAI image generation model
- 🛡️ **Request Validation** - Joi-based validation for all inputs
- 📊 **Rate Limiting** - Configurable rate limits to prevent abuse
- 📝 **Structured Logging** - Winston-based JSON logging
- 🔄 **Retry Logic** - Automatic retries with exponential backoff
- 📈 **Usage Tracking** - Comprehensive API usage statistics
- 🧪 **Comprehensive Tests** - Full test coverage with Jest

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status and service availability.

### Image Generation
```
POST /api/generateImage
```

**Request Body:**
```json
{
  "prompt": "A beautiful cosmic nebula with swirling colors",
  "imageCount": 4,
  "responseFormat": "url"
}
```

**Parameters:**
- `prompt` (string, required): Image description (10-1000 characters)
- `imageCount` (number, optional): Number of images to generate (1-10, default: 4)  
- `responseFormat` (string, optional): Response format (`url` or `base64`, default: `url`)

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "format": "url",
      "url": "https://...",
      "index": 0
    }
  ],
  "metadata": {
    "imageCount": 4,
    "responseFormat": "url",
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "duration": "2.5s"
  },
  "usage": {
    "total_tokens": 100
  }
}
```

## Setup & Installation

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Configure your environment variables:
```bash
# xAI API Key (required)
XAI_API_KEY=your-xai-api-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# CORS
CORS_ORIGIN=*
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:3001` (or your configured PORT).

### 4. Verify Installation

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Test image generation:
```bash
curl -X POST http://localhost:3001/api/generateImage \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cosmic horror scene with tentacles in space"}'
```

## Development

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Code Style

Lint your code:
```bash
npm run lint
```

### Project Structure

```
backend/
├── services/
│   └── grokImageService.js    # Grok API integration
├── utils/
│   ├── logger.js              # Winston logging setup
│   └── errorHandler.js        # Error handling utilities
├── __tests__/
│   ├── server.test.js         # Integration tests
│   └── grokImageService.test.js # Unit tests
├── server.js                  # Main Express server
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Configuration

### Rate Limiting

Configure rate limits in your `.env`:
```bash
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requests per window
```

### Logging

Set log level and format:
```bash
LOG_LEVEL=info                   # error, warn, info, debug
LOG_FORMAT=json                  # json or pretty
```

In production, logs are written to:
- `logs/error.log` - Error level logs only
- `logs/combined.log` - All logs

### CORS

Configure allowed origins:
```bash
CORS_ORIGIN=*                    # Allow all origins
# OR
CORS_ORIGIN=https://mydomain.com # Specific domain only
```

## Error Handling

The server provides comprehensive error handling with appropriate HTTP status codes:

- `400` - Validation errors
- `401` - Invalid API key  
- `429` - Rate limit exceeded
- `500` - Internal server errors
- `503` - Service unavailable
- `504` - Timeout errors

All errors include structured JSON responses with error details.

## Monitoring & Usage

### Usage Statistics

The Grok service tracks comprehensive usage statistics:
- Total requests made
- Success/failure rates
- Images generated
- Tokens consumed

Access via the service's `getUsageStats()` method.

### Health Checks

The `/health` endpoint provides:
- Server uptime
- Service configuration status
- Timestamp and environment info

## Security

- ✅ API keys never exposed to client
- ✅ Request validation prevents injection attacks
- ✅ Rate limiting prevents abuse
- ✅ Structured logging for security monitoring
- ✅ CORS configuration for cross-origin protection

## Deployment

### Environment Variables

**Required:**
- `XAI_API_KEY` - Your xAI API key

**Optional:**
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `RATE_LIMIT_*` - Rate limiting configuration
- `LOG_*` - Logging configuration
- `CORS_ORIGIN` - CORS configuration

### Docker (Optional)

Build and run with Docker:
```bash
docker build -t apophenia-backend .
docker run -p 3001:3001 --env-file .env apophenia-backend
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `CORS_ORIGIN`
- [ ] Set up log rotation
- [ ] Configure process monitoring (PM2, etc.)
- [ ] Set up health check monitoring
- [ ] Enable HTTPS

## Troubleshooting

### Common Issues

**"XAI_API_KEY not configured"**
- Ensure your `.env` file contains a valid xAI API key
- Verify the environment variable is loaded

**Rate limiting errors**
- Adjust `RATE_LIMIT_*` settings in `.env`
- Check if requests exceed configured limits

**Connection timeouts**
- xAI API may be experiencing issues
- Check service status and retry logic

**High memory usage**
- Monitor image generation frequency
- Consider implementing response caching

### Debug Mode

Enable detailed logging:
```bash
LOG_LEVEL=debug npm run dev
```

### Support

For issues related to:
- xAI API: Check [xAI documentation](https://docs.x.ai/)
- This backend: Open an issue in the repository
- General setup: See the main Apophenia README