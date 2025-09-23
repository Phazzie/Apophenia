# 🔒 SECURE DEPLOYMENT GUIDE - NO API KEY EXPOSURE

This guide shows how to deploy Apophenia **without exposing API keys** in the frontend. The API keys are kept secure on the backend server.

## 🏗️ Architecture Overview

```
Frontend (React/Vite) → Backend API Server → Google AI APIs
   (No API keys)         (Secure API keys)    (Protected)
```

## 🚀 Deployment Options

### Option 1: DigitalOcean + Vercel (Recommended)

**Backend (DigitalOcean App Platform):**
1. Create a DigitalOcean account and go to App Platform
2. Create a new app from GitHub repository
3. Configure the app:
   - **Service Type**: Web Service
   - **Source**: Your GitHub repository
   - **Build Command**: `npm install`
   - **Run Command**: `npm run server`
   - **HTTP Port**: 3001
4. Set environment variables in DigitalOcean dashboard:
   ```
   GEMINI_API_KEY=your-google-gemini-api-key
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```
5. Deploy and note your DigitalOcean app URL (e.g., `https://your-app.ondigitalocean.app`)

**Frontend (Vercel):**
1. Update `src/services/secureApiClient.ts`:
   ```typescript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-app.ondigitalocean.app'  // Your DigitalOcean URL
     : 'http://localhost:3001';
   ```
2. Deploy frontend to Vercel: `vercel --prod`
3. **No environment variables needed for frontend!**

### Option 2: Vercel Full-Stack (Serverless Functions)

**Deploy Both Frontend and Backend to Vercel:**

1. Create `api/` directory in project root
2. Move backend endpoints to Vercel serverless functions:
   ```
   api/health.js
   api/generate-concept.js
   api/next-step.js
   api/generate-image.js
   api/summarize-history.js
   ```
3. Update `vercel.json`:
   ```json
   {
     "builds": [
       { "src": "api/**/*.js", "use": "@vercel/node" },
       { "src": "package.json", "use": "@vercel/static-build" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/api/$1" },
       { "src": "/(.*)", "dest": "/$1" }
     ]
   }
   ```
4. Set environment variables in Vercel dashboard:
   ```
   GEMINI_API_KEY=your-google-gemini-api-key
   ```
5. Deploy with: `vercel --prod`

### Option 3: DigitalOcean Droplet (Self-Hosted)

**Backend on DigitalOcean Droplet:**
```bash
# Create Ubuntu 22.04 droplet
# SSH into droplet and setup:

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup project
git clone your-repo
cd Apophenia
npm install

# Create environment file
cp .env.server.example .env
# Edit .env with your GEMINI_API_KEY

# Start with PM2
pm2 start server.js --name "apophenia-api"
pm2 startup
pm2 save

# Setup nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/apophenia
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Frontend (Vercel):**
```bash
# Update API_BASE_URL in secureApiClient.ts
# Deploy to Vercel with your DigitalOcean domain
```

### Option 4: Render (Alternative)

1. Create a Render account
2. Create a **Web Service** for the backend:
   - Build Command: `npm install`
   - Start Command: `npm run server`
   - Environment Variables:
     ```
     GEMINI_API_KEY=your-google-gemini-api-key
     NODE_ENV=production
     ```
3. Create a **Static Site** for the frontend:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Update API_BASE_URL with your backend service URL

## 🛡️ Security Benefits

✅ **API Keys Never Exposed**: Keys stay on the backend server only
✅ **Frontend Security**: No sensitive data in browser/source code  
✅ **Vite Still Used**: Frontend benefits from Vite's dev experience
✅ **Rate Limiting**: Can add rate limiting to backend API
✅ **Request Validation**: Backend can validate and sanitize requests

## 🔧 Development Setup

**Terminal 1 (Backend):**
```bash
cp .env.server.example .env
# Add your GEMINI_API_KEY to .env
npm run server:dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

**Or run both together:**
```bash
npm run fullstack:dev
```

## 📋 Environment Variables

**Backend Only (.env):**
```
GEMINI_API_KEY=your-google-gemini-api-key
PORT=3001
NODE_ENV=development
```

**Frontend (None required!):**
- No environment variables needed
- No API keys exposed
- No VITE_ prefixed variables

## 🧪 Testing the Secure Setup

1. Start backend: `npm run server`
2. Test API endpoint: `curl http://localhost:3001/api/health`
3. Start frontend: `npm run dev`
4. Game should work without any frontend API keys!

## 📦 Docker Deployment (Optional)

**Backend Dockerfile:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./
EXPOSE 3001
CMD ["npm", "run", "server"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## 🔍 Cost Comparison

| Platform | Backend Cost | Frontend Cost | Total/Month |
|----------|-------------|---------------|-------------|
| DigitalOcean + Vercel | $5-12 | Free | $5-12 |
| Vercel Full-Stack | Included | Free | $0-20 |
| DigitalOcean Droplet | $5-10 | Free | $5-10 |
| Render | $7 | Free | $7 |

## 🚨 Important Notes

1. **Update API_BASE_URL**: Always update the production URL in `secureApiClient.ts`
2. **CORS Configuration**: Backend includes CORS middleware for frontend access
3. **Error Handling**: Graceful fallbacks when backend is unavailable
4. **Scaling**: Backend can be scaled independently of frontend
5. **Monitoring**: Set up health checks and logging for production

This setup provides **maximum security** while maintaining all the benefits of Vite for development and the full game functionality!

## 🛡️ Security Benefits

✅ **API Keys Never Exposed**: Keys stay on the backend server only
✅ **Frontend Security**: No sensitive data in browser/source code  
✅ **Vite Still Used**: Frontend benefits from Vite's dev experience
✅ **Rate Limiting**: Can add rate limiting to backend API
✅ **Request Validation**: Backend can validate and sanitize requests

## 🔧 Development Setup

**Terminal 1 (Backend):**
```bash
cp .env.server.example .env
# Add your GEMINI_API_KEY to .env
npm run server:dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

**Or run both together:**
```bash
npm run fullstack:dev
```

## 📋 Environment Variables

**Backend Only (.env):**
```
GEMINI_API_KEY=your-google-gemini-api-key
PORT=3001
NODE_ENV=development
```

**Frontend (None required!):**
- No environment variables needed
- No API keys exposed
- No VITE_ prefixed variables

## 🧪 Testing the Secure Setup

1. Start backend: `npm run server`
2. Test API endpoint: `curl http://localhost:3001/api/health`
3. Start frontend: `npm run dev`
4. Game should work without any frontend API keys!

## 📦 Docker Deployment (Optional)

**Backend Dockerfile:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./
EXPOSE 3001
CMD ["npm", "run", "server"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## 🔍 Verification

**Security Check:**
- ✅ No `VITE_` environment variables needed
- ✅ No API keys in frontend source code
- ✅ No API keys in browser developer tools
- ✅ All AI requests go through secure backend

**Performance Check:**
- ✅ Frontend still benefits from Vite's optimizations
- ✅ Backend provides fast API responses
- ✅ Caching can be added to backend for improved performance

## 🚨 Important Notes

1. **Update API_BASE_URL**: Always update the production URL in `secureApiClient.ts`
2. **CORS Configuration**: Backend includes CORS middleware for frontend access
3. **Error Handling**: Graceful fallbacks when backend is unavailable
4. **Scaling**: Backend can be scaled independently of frontend

This setup provides **maximum security** while maintaining all the benefits of Vite for development and the full game functionality!