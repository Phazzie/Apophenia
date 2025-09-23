# 🌊 DigitalOcean Deployment Guide for Apophenia

**Complete guide for deploying Apophenia AI-driven narrative game on DigitalOcean infrastructure**

---

## 🎯 Overview

This guide provides step-by-step instructions for deploying Apophenia on DigitalOcean using multiple deployment strategies. Choose the option that best fits your needs and technical requirements.

### Deployment Options

1. **App Platform (Recommended)** - Easiest, fully managed
2. **Droplet with Docker** - Most flexible, full control
3. **Kubernetes** - Enterprise-scale, high availability
4. **Functions** - Serverless, cost-effective for low traffic

---

## 🚀 Option 1: DigitalOcean App Platform (Recommended)

**Best for**: Quick deployment, managed infrastructure, automatic scaling

### Prerequisites

- DigitalOcean account
- GitHub repository with Apophenia code
- Google Gemini API key (optional, but recommended)

### Step 1: Prepare Your Repository

```bash
# Ensure your repository has the required configuration files
# These should already exist in the Apophenia repository:
ls -la .env.example package.json vercel.json
```

### Step 2: Create App Platform Application

1. **Log into DigitalOcean Console**
   - Navigate to [DigitalOcean Console](https://cloud.digitalocean.com/)
   - Click "Create" → "Apps"

2. **Connect GitHub Repository**
   - Select "GitHub" as your source
   - Authorize DigitalOcean to access your repositories
   - Choose your Apophenia repository
   - Select the main branch

3. **Configure Build Settings**
   ```yaml
   # App Platform will auto-detect, but verify these settings:
   Build Command: npm install && npm run build
   Run Command: npm start
   Output Directory: dist
   ```

4. **Set Environment Variables**
   ```env
   # Required for full functionality
   VITE_GEMINI_API_KEY=your-google-gemini-api-key
   
   # App Platform specific
   NODE_ENV=production
   ```

### Step 3: Configure App Resources

```yaml
# Recommended App Platform configuration
name: apophenia-cosmic-narrative
services:
- name: web
  source_dir: /
  github:
    repo: your-username/Apophenia
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs  # $5/month
  http_port: 3000
  routes:
  - path: /
```

### Step 4: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Settings → Domains
   - Add your domain (e.g., `mynarrative.com`)
   - Update DNS records as provided

2. **SSL Certificate**
   - Automatically provisioned by App Platform
   - No additional configuration needed

### Step 5: Deploy and Validate

```bash
# App Platform will automatically deploy
# Monitor deployment progress in the console

# Once deployed, test your application:
curl -I https://your-app.ondigitalocean.app
```

---

## 🐳 Option 2: Droplet with Docker

**Best for**: Full control, custom configuration, cost optimization

### Prerequisites

- DigitalOcean Droplet (Ubuntu 22.04 recommended)
- Docker and Docker Compose installed
- Domain name (optional)

### Step 1: Create and Configure Droplet

```bash
# Create a new Droplet
# Size: 1 GB RAM ($6/month) minimum, 2 GB recommended
# Region: Choose closest to your users
# OS: Ubuntu 22.04 x64

# SSH into your droplet
ssh root@your-droplet-ip
```

### Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Install Nginx (for reverse proxy)
apt install nginx -y

# Install Node.js (for building)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### Step 3: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/Apophenia.git
cd Apophenia

# Create environment file
cp .env.example .env.production
nano .env.production

# Add your API keys:
# VITE_GEMINI_API_KEY=your-api-key
# NODE_ENV=production
```

### Step 4: Create Docker Configuration

```dockerfile
# Create Dockerfile (if not exists)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

```yaml
# Create docker-compose.yml
version: '3.8'

services:
  apophenia:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - apophenia
    restart: unless-stopped
```

### Step 5: Configure Nginx

```nginx
# Create nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream apophenia {
        server apophenia:3000;
    }
    
    server {
        listen 80;
        server_name your-domain.com;
        
        location / {
            proxy_pass http://apophenia;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### Step 6: Deploy with Docker

```bash
# Build and start services
docker compose up -d

# Verify deployment
docker compose ps
docker compose logs apophenia

# Test application
curl -I http://localhost
```

### Step 7: SSL Certificate with Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com

# Verify auto-renewal
certbot renew --dry-run
```

---

## ☸️ Option 3: DigitalOcean Kubernetes

**Best for**: High availability, automatic scaling, enterprise needs

### Prerequisites

- DigitalOcean Kubernetes (DOKS) cluster
- kubectl configured
- Docker Hub or DigitalOcean Container Registry

### Step 1: Create DOKS Cluster

```bash
# Using DigitalOcean CLI
doctl kubernetes cluster create apophenia-cluster \
  --count 3 \
  --size s-2vcpu-2gb \
  --region nyc1
```

### Step 2: Build and Push Container

```bash
# Build container image
docker build -t your-registry/apophenia:latest .

# Push to registry
docker push your-registry/apophenia:latest
```

### Step 3: Create Kubernetes Manifests

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apophenia
spec:
  replicas: 3
  selector:
    matchLabels:
      app: apophenia
  template:
    metadata:
      labels:
        app: apophenia
    spec:
      containers:
      - name: apophenia
        image: your-registry/apophenia:latest
        ports:
        - containerPort: 3000
        env:
        - name: VITE_GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: apophenia-secrets
              key: gemini-api-key
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: apophenia-service
spec:
  selector:
    app: apophenia
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Step 4: Deploy to Kubernetes

```bash
# Create secret for API keys
kubectl create secret generic apophenia-secrets \
  --from-literal=gemini-api-key=your-api-key

# Deploy application
kubectl apply -f deployment.yaml

# Check deployment status
kubectl get pods
kubectl get services
```

---

## ⚡ Option 4: DigitalOcean Functions

**Best for**: Serverless, cost-effective for low traffic

### Prerequisites

- DigitalOcean CLI (doctl)
- Functions namespace created

### Step 1: Prepare Function Code

```javascript
// packages/apophenia/index.js
const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

module.exports = app;
```

### Step 2: Create Functions Configuration

```yaml
# project.yml
packages:
  - name: apophenia
    environment:
      VITE_GEMINI_API_KEY: ${GEMINI_API_KEY}
    functions:
      - name: web
        runtime: nodejs:18
        web: true
        main: index.js
```

### Step 3: Deploy Function

```bash
# Deploy to DigitalOcean Functions
doctl serverless deploy .

# Get function URL
doctl serverless functions get apophenia/web --url
```

---

## Using the DigitalOcean App Spec (App Platform)

A production–friendly `digitalocean.app.yaml` is included in the repo. This defines two services:

1. `apophenia-frontend` (static build of the Vite app)
2. `apophenia-api` (Express server in `server.js` that keeps the Gemini key private)

### File: `digitalocean.app.yaml`
(Already added to repository.) Update the placeholder secret before first deploy.

Replace:
```
value: "REPLACE_WITH_REAL_KEY"
```
With your actual Gemini API key (or set it securely in the DO dashboard after creation and remove the inline value).

### Deploy via CLI
```bash
# 1. Install doctl
brew install doctl                # macOS (Homebrew)
# or
sudo snap install doctl           # Ubuntu (Snap) OR download from GitHub releases

# 2. Authenticate
export DIGITALOCEAN_TOKEN=your_do_personal_access_token
# or interactively:
doctl auth init

# 3. Validate auth
doctl account get

# 4. Create the app from the spec
doctl apps create --spec digitalocean.app.yaml

# 5. List apps & capture APP_ID
doctl apps list

# 6. Watch deployment
doctl apps deployments list <APP_ID>

# 7. View logs (build & runtime)
doctl apps logs <APP_ID> --type build

doctl apps logs <APP_ID> --type run --component apophenia-api

# 8. Update after changes
doctl apps update <APP_ID> --spec digitalocean.app.yaml
```

### Environment Variable Management
After initial creation, remove the hard‑coded secret in the YAML (or never commit it) and manage via dashboard or:
```bash
doctl apps update <APP_ID> --spec digitalocean.app.yaml \
  --env GEMINI_API_KEY=your_key_here
```

### Health & Readiness
Current health endpoint: `GET /api/health`
Optionally add `/api/ready` if you introduce async warm‑up (model priming, cache hydration, etc.).

### Frontend → Backend Calls
The YAML sets:
```
VITE_API_BASE_URL=/api
```
Ensure the frontend uses that base path when calling the Express endpoints so App Platform routing works.

### Next Improvements (Optional)
- Add basic rate limiting middleware to `server.js`
- Serve `dist/` from Express for single-service deployment (if you prefer consolidation)
- Add `/api/ready` endpoint
- Add caching layer for repeated AI prompts

Let me know if you want me to implement any/all of those now.

---

## 🔧 Environment Variables Configuration

### Required Variables

```env
# Core functionality
VITE_GEMINI_API_KEY=your-google-gemini-api-key

# Production settings
NODE_ENV=production
PORT=3000
```

### Security Best Practices

```bash
# Use DigitalOcean Secrets Management
# Never commit API keys to repository
# Rotate keys regularly
# Monitor usage for anomalies

# For App Platform
doctl apps create-secret \
  --app-id your-app-id \
  --name GEMINI_API_KEY \
  --value your-api-key
```

---

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# App Platform health check
curl -f https://your-app.ondigitalocean.app/health || exit 1

# Droplet monitoring
systemctl status docker
docker compose ps
```

### Log Monitoring

```bash
# App Platform logs
doctl apps logs your-app-id

# Docker logs
docker compose logs -f apophenia

# System logs
journalctl -u nginx -f
```

### Performance Optimization

```yaml
# App Platform scaling
spec:
  services:
  - name: web
    instance_count: 2  # Auto-scale based on traffic
    instance_size_slug: professional-xs  # Upgrade for better performance
```

### Backup Strategy

```bash
# Database backup (if using)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Application files backup
tar -czf app-backup-$(date +%Y%m%d).tar.gz /path/to/app

# DigitalOcean Snapshots
doctl compute droplet-action snapshot your-droplet-id --snapshot-name "apophenia-$(date +%Y%m%d)"
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check Node.js version
   node --version  # Should be 18+
   
   # Clear npm cache
   npm cache clean --force
   npm install
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify environment variables
   env | grep VITE_
   
   # Check App Platform environment
   doctl apps spec get your-app-id
   ```

3. **SSL Certificate Issues**
   ```bash
   # Renew Let's Encrypt certificate
   certbot renew
   
   # Check certificate status
   certbot certificates
   ```

4. **Performance Issues**
   ```bash
   # Monitor resource usage
   htop
   docker stats
   
   # Check application logs
   docker compose logs apophenia | tail -100
   ```

### Support Resources

- **DigitalOcean Documentation**: https://docs.digitalocean.com/
- **Apophenia Issues**: https://github.com/Phazzie/Apophenia/issues
- **Community Support**: DigitalOcean Community Forums

---

## 💡 Cost Optimization

### Pricing Comparison

| Option | Monthly Cost | Best For |
|--------|-------------|-----------|
| App Platform | $5-12 | Small to medium apps |
| Basic Droplet | $6-12 | Full control needs |
| DOKS | $12+ | Enterprise scale |
| Functions | $0-5 | Low traffic |

### Cost-Saving Tips

1. **Use Basic instance sizes for development**
2. **Enable auto-scaling only when needed**
3. **Monitor and optimize resource usage**
4. **Use DigitalOcean credits for testing**
5. **Consider Reserved Instances for predictable workloads**

---

## 🎉 Next Steps

After successful deployment:

1. **Configure Domain and SSL**
2. **Set up Monitoring and Alerts**
3. **Implement Backup Strategy**
4. **Performance Testing and Optimization**
5. **Security Hardening**
6. **Documentation Updates**

---

**🌌 Your AI-driven cosmic horror narrative is now live on DigitalOcean!**

*For additional support or advanced configurations, refer to the [Technical Documentation](TECHNICAL_DEBT_AUDIT.md) or create an issue on the project repository.*