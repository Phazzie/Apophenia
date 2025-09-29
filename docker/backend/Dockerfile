# Backend Dockerfile for Apophenia
# Node runtime for Express server

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including production dependencies for server)
RUN npm ci --only=production --silent

# Copy server files
COPY server.js ./
COPY server/ ./server/

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apophenia -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R apophenia:nodejs /app
USER apophenia

# Expose the server port
EXPOSE 3001

# Health check using Node.js HTTP module instead of curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Start the server
CMD ["node", "server.js"]