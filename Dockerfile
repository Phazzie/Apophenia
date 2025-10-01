


# Stage 1: Build the frontend
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies)
# required for the build process.
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the frontend. The output will be in the /app/dist directory.
RUN npm run build

# Stage 2: Create the final production image
FROM node:18-alpine

WORKDIR /app

# Copy package files again for the production stage
COPY package*.json ./

# Install only production dependencies. This creates a smaller and more secure image.
RUN npm install --omit=dev

# Copy the server implementation from the source
COPY server.js ./
COPY server/ ./server/

# Copy the built frontend assets from the builder stage into the final image
COPY --from=builder /app/dist ./dist

# Expose the port the server will run on
EXPOSE 3001

# Set environment variables for production and tell the server to host the static frontend files.
ENV NODE_ENV=production
ENV SERVE_STATIC=true

# The command to run the application
CMD ["node", "server.js"]