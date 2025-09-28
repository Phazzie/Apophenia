# Apophenia Backend - Grok Image Proxy

A secure Express.js backend server that provides a proxy for X.AI's Grok image generation API. This server handles API key management, rate limiting, request validation, and structured logging while providing a clean interface for the Apophenia frontend.

## Features

- **Grok Integration**: Direct integration with xAI's grok-2-image-1212 model
- **Rate Limiting**: Built-in protection against abuse with configurable limits
- **Request Validation**: Input validation and sanitization using express-validator
- **Structured Logging**: Comprehensive logging using Winston for monitoring and debugging
- **Retry Logic**: Automatic retry with exponential backoff for failed requests
- **Usage Tracking**: Detailed usage logging for cost monitoring and analytics
- **Error Handling**: Graceful error handling with appropriate HTTP status codes
- **CORS Support**: Configurable CORS for frontend integration
- **Health Monitoring**: Health check endpoint for service monitoring

## Setup

### 1. Install Dependencies

```bash
cd backend/
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit the `.env` file and set your values:

```env
# Required: X.AI API key for Grok image generation
XAI_API_KEY=your-xai-api-key-here

# Optional: Server configuration
PORT=3001
NODE_ENV=development

# Optional: Frontend URLs for CORS (comma-separated)
FRONTEND_URL=http://localhost:5173,http://localhost:3000
```

### 3. Start the Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

Returns server status and configuration information.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "services": {
    "grok": true
  }
}
```

### Generate Images
```
POST /api/generateImage
```

Generate images using Grok's image generation model.

**Request Body:**
```json
{
  "prompt": "A cosmic horror scene in space",
  "imageCount": 2,
  "responseFormat": "url"
}
```

**Parameters:**
- `prompt` (required): Text prompt for image generation (1-1000 characters)
- `imageCount` (optional): Number of images to generate (1-10, defaults to 1)
- `responseFormat` (optional): Response format - "url" or "base64" (defaults to "url")

**Response:**
```json
{
  "success": true,
  "requestId": "req_1642244400000_abc123def",
  "images": [
    "https://generated-image-url-1.com",
    "https://generated-image-url-2.com"
  ],
  "metadata": {
    "model": "grok-2-image-1212",
    "imageCount": 2,
    "responseFormat": "url",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Rate Limiting

The server implements two levels of rate limiting:

1. **General API**: 100 requests per 15 minutes per IP
2. **Image Generation**: 50 requests per hour per IP

Rate limit headers are included in responses:
- `RateLimit-Limit`: Request limit
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Time when limit resets

## Error Handling

The API returns appropriate HTTP status codes with detailed error messages:

- `400`: Bad Request (validation errors)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error
- `503`: Service Unavailable (API key not configured)
- `504`: Gateway Timeout (request timeout)

**Error Response Format:**
```json
{
  "error": "Error description",
  "requestId": "req_1642244400000_abc123def",
  "details": [] // Additional details for validation errors
}
```

## Retry Logic

The server implements automatic retry with exponential backoff:
- **Max Retries**: 3 attempts
- **Base Delay**: 1 second
- **Backoff Multiplier**: 2x

## Logging

Structured logging is implemented using Winston with the following log levels:
- `info`: General information, requests, successful operations
- `warn`: Warnings, retry attempts, rate limit violations
- `error`: Errors, failures, exceptions

Log entries include relevant metadata like request IDs, user IPs, and operation details.

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode for development:

```bash
npm run test:watch
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2 or Docker
3. Configure proper logging aggregation
4. Set up monitoring for the `/health` endpoint
5. Configure load balancing if running multiple instances

## Security Considerations

- API keys are stored server-side only, never exposed to frontend
- Rate limiting prevents abuse
- Request validation prevents injection attacks  
- CORS configuration restricts frontend access
- Structured logging helps with security monitoring

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `XAI_API_KEY` | Yes | - | X.AI API key for Grok image generation |
| `PORT` | No | 3001 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `FRONTEND_URL` | No | localhost:5173,localhost:3000 | Allowed CORS origins |

## Development

### Project Structure
```
backend/
├── server.js          # Main Express server
├── package.json       # Dependencies and scripts
├── .env.example       # Environment template
├── README.md          # This file
└── __tests__/         # Test files
```

### Adding New Features

1. Follow the existing middleware and error handling patterns
2. Add appropriate validation using express-validator
3. Include structured logging for monitoring
4. Add tests for new endpoints
5. Update this README with new API documentation