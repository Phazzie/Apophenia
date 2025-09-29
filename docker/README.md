# 🐳 Docker Containerization for Apophenia

This directory contains Docker configurations for containerizing Apophenia for deployment on DigitalOcean and other platforms.

## 📁 Structure

```
docker/
├── frontend/
│   └── Dockerfile          # Frontend: Node build → nginx serve
├── backend/
│   └── Dockerfile          # Backend: Node runtime for Express server
deployment/
└── spec.yaml              # DigitalOcean App Platform specification
```

## 🏗️ Building Images

### Frontend (React + Nginx)
```bash
# Build frontend image
docker build -f docker/frontend/Dockerfile -t apophenia-frontend .

# Run frontend container
docker run -p 8080:80 apophenia-frontend

# Test frontend
curl http://localhost:8080/health
```

### Backend (Express Server)
```bash
# Build backend image  
docker build -f docker/backend/Dockerfile -t apophenia-backend .

# Run backend container with environment variables
docker run -p 3001:3001 \
  -e GEMINI_API_KEY=your-api-key \
  -e NODE_ENV=production \
  apophenia-backend

# Test backend
curl http://localhost:3001/api/health
```

## 🚀 DigitalOcean Deployment

### Option 1: Direct Docker Build (Recommended)
Deploy using the DigitalOcean App Platform specification:

```bash
# Deploy to DigitalOcean App Platform
doctl apps create --spec deployment/spec.yaml
```

The spec file supports two deployment modes:
- **Build from source**: Builds Docker images during deployment (recommended)
- **Pre-built images**: Uses images from GitHub Container Registry

### Option 2: GitHub Container Registry (GHCR)
For pre-built images, first build and push to GHCR:

```bash
# Build and tag for GHCR
docker build -f docker/frontend/Dockerfile -t ghcr.io/phazzie/apophenia-frontend:latest .
docker build -f docker/backend/Dockerfile -t ghcr.io/phazzie/apophenia-backend:latest .

# Push to GHCR (requires authentication)
docker push ghcr.io/phazzie/apophenia-frontend:latest
docker push ghcr.io/phazzie/apophenia-backend:latest
```

Then uncomment the image sections in `deployment/spec.yaml`.

## 🔧 Configuration

### Environment Variables

**Frontend (Build-time):**
- `VITE_API_BASE_URL`: API base URL (default: `/api`)
- `VITE_GEMINI_API_KEY`: Gemini API key for client-side calls
- `VITE_XAI_API_KEY`: X.AI API key for Grok integration

**Backend (Runtime):**
- `NODE_ENV`: Environment mode (production/development)
- `PORT`: Server port (default: 3001)
- `GEMINI_API_KEY`: Gemini API key for server-side calls
- `XAI_API_KEY`: X.AI API key for server-side calls
- `CORS_ORIGIN`: Allowed CORS origin
- `SERVE_STATIC`: Whether to serve static files (false for containerized frontend)

### Health Checks

Both containers include health checks:
- **Frontend**: `GET /health` (nginx endpoint)
- **Backend**: `GET /api/health` (Express endpoint)

## 🏠 Local Development

For local development with Docker Compose:

```bash
# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
    ports:
      - "8080:80"
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - XAI_API_KEY=${XAI_API_KEY}
      - CORS_ORIGIN=http://localhost:8080
    env_file:
      - .env
EOF

# Start services
docker-compose up --build
```

## 📊 Image Specifications

| Component | Base Image | Final Size | Exposed Port | Health Check |
|-----------|------------|------------|--------------|--------------|
| Frontend | nginx:alpine | ~53MB | 80 | `/health` |
| Backend | node:20-alpine | ~136MB | 3001 | `/api/health` |

## 🔒 Security Features

- **Non-root user**: Backend runs as `apophenia` user (UID 1001)
- **Minimal base images**: Alpine Linux for smaller attack surface
- **Health checks**: Built-in container health monitoring
- **Environment separation**: Build-time vs runtime environment variables
- **CORS protection**: Configurable CORS origins

## 🐛 Troubleshooting

### Build Issues
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -f docker/frontend/Dockerfile -t apophenia-frontend .
```

### Runtime Issues
```bash
# Check container logs
docker logs <container-id>

# Test health endpoints
curl -f http://localhost/health          # Frontend
curl -f http://localhost:3001/api/health # Backend
```

### DigitalOcean Deployment Issues
```bash
# Check deployment logs
doctl apps logs <app-id>

# Update app with new spec
doctl apps update <app-id> --spec deployment/spec.yaml
```

## 🚀 Production Optimizations

- **Multi-stage builds**: Reduces final image size
- **Production dependencies only**: `npm ci --only=production`
- **Static file serving**: nginx for frontend, Express for API only
- **Health checks**: Automatic container health monitoring
- **Resource limits**: Configurable in DigitalOcean App Platform

## 📚 Additional Resources

- [DigitalOcean App Platform Docker Guide](https://docs.digitalocean.com/products/app-platform/how-to/deploy-docker-image/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)