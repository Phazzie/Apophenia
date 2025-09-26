# JULES' NOTE: This Dockerfile is currently non-functional.
# The server setup it depends on is broken. The `npm install` in the second
# stage does not correctly install dependencies in a way that the `CMD` can
# find them, leading to module resolution errors at runtime. This file needs
# to be fixed in conjunction with the server's package.json and directory structure.

# Stage 1: Build the frontend
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Set up the backend
FROM node:18
WORKDIR /app
COPY --from=builder /app/build ./build
COPY server ./server
WORKDIR /app/server
RUN npm install

EXPOSE 3001
CMD ["node", "index.js"]