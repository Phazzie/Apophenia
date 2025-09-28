# 🚀 Apophenia: Comprehensive Deployment Guide

This guide provides comprehensive instructions for deploying the Apophenia project, with a strong emphasis on security and best practices.

## 🏛️ Recommended Architecture: Secure by Design

To protect API keys and ensure a secure environment, Apophenia uses a split architecture where the frontend (the Vite/React app) is decoupled from a backend service that handles all communication with AI providers.

```
Frontend (Vite/React)  <--HTTPS-->  Backend API (Node.js)  <--API Calls-->  AI Services (Grok, Gemini)
(No API keys)                      (API keys are stored here)
```

**Key Security Benefits:**
*   **No API Key Exposure**: API keys are never exposed to the client-side browser.
*   **Centralized Logic**: The backend can handle request validation, rate limiting, and caching.
*   **Flexible Hosting**: You can host the frontend and backend on different platforms optimized for their specific needs.

---

## 🔧 Environment Setup

### Backend Environment Variables
Create a `.env` file for your backend server based on `.env.example`.

```env
# AI Provider API Keys
VITE_XAI_API_KEY="your-xai-api-key-here"
VITE_GEMINI_API_KEY="your-google-gemini-api-key"

# Server Configuration
NODE_ENV="production"
PORT=3001 # Or any port your hosting requires

# The public URL of your deployed frontend for CORS
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Frontend Environment Variables
The frontend requires **no secret environment variables**. It only needs to know the URL of your deployed backend API. This is handled automatically by the build process or can be configured in your deployment service.

---

## 🚀 Deployment Walkthroughs

### Option 1: Vercel (Frontend) + DigitalOcean (Backend) - Recommended

This combination offers a world-class developer experience and free hosting for the frontend (Vercel) with a robust, scalable backend (DigitalOcean App Platform).

**Part A: Deploy the Backend to DigitalOcean App Platform**

1.  **Prepare**: Make sure your code is pushed to a GitHub repository.
2.  **Create App**: In the DigitalOcean Console, go to "Create" -> "Apps".
3.  **Connect Repo**: Select your Apophenia repository and the `main` branch.
4.  **Configure Service**: DigitalOcean will auto-detect a Node.js service. Ensure the settings are:
    *   **Service Type**: Web Service
    *   **Source**: Your GitHub repository
    *   **Build Command**: `npm install`
    *   **Run Command**: `npm run server`
    *   **HTTP Port**: 3001
5.  **Set Environment Variables**: In the DigitalOcean dashboard, go to your app's "Settings" -> "Environment Variables" and add the backend variables (`VITE_GEMINI_API_KEY`, `PORT`, `CORS_ORIGIN`).
6.  **Deploy**: Launch the service. Once deployed, note your backend's public URL (e.g., `https://your-app.ondigitalocean.app`).

**Part B: Deploy the Frontend to Vercel**

1.  **Configure Backend URL**: In `src/config.ts` (or a similar configuration file), ensure the `API_BASE_URL` points to your DigitalOcean backend URL for production builds.
2.  **Connect to Vercel**: Import your GitHub repository into Vercel.
3.  **Configure Project**: Vercel will auto-detect that it is a Vite project.
4.  **Set Environment Variable**: Add one environment variable: `VITE_API_BASE_URL` and set its value to your DigitalOcean app URL.
5.  **Deploy**: Vercel will build and deploy the frontend.

### Option 2: Full-Stack on Vercel (with Serverless Functions)

This approach deploys both the frontend and the backend API to Vercel, using serverless functions for the backend.

1.  **Structure**: Ensure your backend logic is placed inside an `api/` directory in the root of the project, which Vercel uses for serverless functions.
2.  **Configure `vercel.json`**: Make sure your `vercel.json` is configured to handle both the static frontend build and the serverless functions.
3.  **Environment Variables**: Add your secret API keys (`VITE_GEMINI_API_KEY`, etc.) to the Vercel project settings.
4.  **Deploy**: Connect your repository to Vercel and deploy. Vercel will build the frontend and deploy the serverless functions automatically.

### Option 3: Docker Deployment

This method provides maximum flexibility, allowing you to deploy on any cloud provider that supports Docker containers.

1.  **`Dockerfile`**: The repository includes a multi-stage `Dockerfile` to build an optimized production image.
2.  **Build the Image**:
    ```bash
    docker build -t apophenia-app .
    ```
3.  **Run the Container**:
    ```bash
    docker run -p 8080:80 \
      -e VITE_GEMINI_API_KEY="your-key" \
      -e NODE_ENV="production" \
      apophenia-app
    ```
    *Note: The included `Dockerfile` builds and serves the static assets from Nginx. For a secure deployment, you would need two separate containers: one for the backend Node.js server and one for the frontend assets, managed via a tool like Docker Compose.*

---

## 🔍 Deployment Verification

After deployment, verify that the application is running correctly:

1.  **Visit URL**: Open your frontend URL. The application should load.
2.  **API Health Check**: Use the in-app "Test API" button or manually access the backend's health check endpoint (e.g., `https://your-backend-url/api/health`).
3.  **Full Game Flow**: Start a new game and proceed through a few steps to ensure the AI is responding correctly.
4.  **Browser Console**: Check for any errors in the browser's developer console.

---

## 🐛 Troubleshooting

*   **CORS Errors**: If the frontend cannot communicate with the backend, ensure the `CORS_ORIGIN` environment variable on your backend is set to the correct frontend URL.
*   **Build Failures**: Run the build command locally (`npm run build`) to diagnose issues. Ensure `NODE_OPTIONS="--max-old-space-size=4096"` is set if you encounter memory issues.
*   **API Key Issues**: Double-check that the API keys are correctly set in your backend environment and that they have the necessary permissions with the AI provider.