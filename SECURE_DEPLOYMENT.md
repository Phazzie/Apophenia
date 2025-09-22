# 🔒 SECURE DEPLOYMENT GUIDE - NO API KEY EXPOSURE

This guide shows how to deploy Apophenia **without exposing API keys** in the frontend. The API keys are kept secure on the backend server.

## 🏗️ Architecture Overview

```
Frontend (React/Vite) → Backend API Server → Google AI APIs
   (No API keys)         (Secure API keys)    (Protected)
```

## 🚀 Deployment Options

### Option 1: Railway + Vercel (Recommended)

**Backend (Railway):**
1. Create a Railway account and new project
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard:
   ```
   GEMINI_API_KEY=your-google-gemini-api-key
   PORT=3001
   NODE_ENV=production
   ```
4. Deploy with: `railway up`
5. Note your Railway backend URL (e.g., `https://your-app.railway.app`)

**Frontend (Vercel):**
1. Update `src/services/secureApiClient.ts`:
   ```typescript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-app.railway.app'  // Your Railway URL
     : 'http://localhost:3001';
   ```
2. Deploy frontend to Vercel: `vercel --prod`
3. **No environment variables needed for frontend!**

### Option 2: Render (Full-Stack)

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

### Option 3: Self-Hosted (VPS/Cloud)

**Backend:**
```bash
# On your server
git clone your-repo
cd Apophenia
npm install
cp .env.server.example .env
# Edit .env with your GEMINI_API_KEY
npm run server
```

**Frontend:**
```bash
# Update API_BASE_URL in secureApiClient.ts
npm run build
# Serve dist/ folder with nginx/apache
```

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