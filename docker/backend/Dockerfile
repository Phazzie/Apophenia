# Stage 1: Install production dependencies
FROM node:18-alpine AS deps

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json from the backend directory
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Stage 2: Create the production image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Create a non-root user to run the application for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the backend application source code
# Note: This copies the contents of the 'backend' directory into the container's WORKDIR
COPY backend/ .

# Expose the port the app runs on
EXPOSE 3001

# The command to run the application
CMD ["npm", "start"]