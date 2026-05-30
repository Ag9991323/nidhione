# Frontend Dockerfile for NidhiOne
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with static file server
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built static files
COPY --from=builder /app/dist ./dist

# Copy serve configuration for SPA routing
COPY serve.json ./serve.json

# Expose port
EXPOSE 5173

# Serve static files with SPA fallback
CMD sh -c 'serve -c serve.json -s dist -l ${PORT:-5173}'
