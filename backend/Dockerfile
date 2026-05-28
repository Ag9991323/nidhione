# Backend Dockerfile for NidhiOne
FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDeps for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client + Build TypeScript
RUN npx prisma generate
RUN npm run build

# ── Production stage ──────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install OpenSSL (needed at runtime too)
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Install production deps + keep prisma CLI for migrations
RUN npm ci --only=production && npm install prisma

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Copy the generated Prisma client (don't regenerate)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

# Run migrations then start
CMD npx prisma migrate deploy && node dist/server.js