# 🚀 Apophenia Deployment Guide
**Consolidated deployment instructions for all environments**

## 📋 Quick Reference

### ⚡ Production Ready Deployments
- **Vercel** (Recommended): Zero-config, automatic deployments
- **Netlify**: Alternative static hosting with edge functions
- **DigitalOcean App Platform**: Full-stack hosting with database options
- **Docker**: Containerized deployment for any environment

---

## 🔧 Environment Setup

### Required Environment Variables
```bash
# Primary AI Model (Required)
VITE_XAI_API_KEY=your-xai-api-key-here

# Fallback AI Model (Recommended)
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Production Settings
NODE_ENV=production
VITE_API_BASE_URL=https://your-domain.com
```

---

## 🌐 Vercel Deployment (Recommended)

**Zero-configuration deployment with automatic builds**

```bash
# Option 1: Deploy from GitHub (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Add environment variables in Vercel dashboard
4. Automatic deployments on push

# Option 2: CLI Deployment
npm install -g vercel
vercel --prod
```

**Environment Configuration in Vercel:**
- Go to Project Settings → Environment Variables
- Add `VITE_XAI_API_KEY` and `VITE_GEMINI_API_KEY`
- Redeploy for changes to take effect

---

## 🐋 Docker Deployment

**Containerized deployment using separate frontend/backend containers**

Apophenia now includes production-ready Docker containers for DigitalOcean and other platforms:

### Quick Start
```bash
# Build both containers
docker build -f docker/frontend/Dockerfile -t apophenia-frontend .
docker build -f docker/backend/Dockerfile -t apophenia-backend .

# Run with docker-compose (recommended for local development)
docker compose up --build

# Access application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3001/api/health
```

### DigitalOcean App Platform
```bash
# Deploy using the containerized spec
doctl apps create --spec deployment/spec.yaml
```

**Architecture**: 
- **Frontend**: React build served by nginx (53MB image)
- **Backend**: Express API server with health checks (136MB image)
- **Security**: Non-root users, minimal Alpine base images
- **Health Checks**: Built-in container health monitoring

📖 **Full Documentation**: See [`docker/README.md`](docker/README.md) for complete setup instructions.

---

## 🔍 Deployment Verification

### Health Check Endpoints
- **Application**: `https://your-domain.com/` (should load game interface)
- **Build Assets**: Check browser network tab for successful asset loading
- **API Integration**: Use in-app "Test API" button to verify AI connectivity

### Performance Validation
```bash
# Lighthouse CI (optional)
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage

# Manual verification
1. Load game in browser
2. Click "Test API" button
3. Create new game to test AI integration
4. Verify model selector functionality
```

---

## 🐛 Common Issues & Solutions

### Build Failures
```bash
# Clear build cache
rm -rf node_modules/.cache dist
npm ci
npm run build
```

### API Key Issues
- Verify environment variables are set correctly
- Check browser console for API key warnings
- Use "Test API" feature to verify connectivity
- Ensure keys have proper permissions for respective providers

### Memory Issues (Large Context Models)
```bash
# Increase Node.js memory limit for builds
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 📊 Deployment Status

| Platform | Status | Auto-Deploy | Environment Variables | Notes |
|----------|---------|-------------|----------------------|-------|
| Vercel | ✅ Ready | Yes | Via Dashboard | Recommended |
| Netlify | ✅ Ready | Yes | Via UI/File | Alternative |
| DigitalOcean | ✅ Ready | Via GitHub | App Spec | Full-stack |
| Docker | ✅ Ready | Manual | Runtime | Universal |

---

## 🔒 Security Considerations

### API Key Management
- **Never commit API keys** to version control
- Use environment variables for all secrets
- Rotate keys regularly
- Monitor API usage for unusual activity

### Production Settings
```bash
NODE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=error
VITE_SOURCE_MAPS=false
```

---

*For detailed provider-specific instructions, see individual deployment guides in the repository.*