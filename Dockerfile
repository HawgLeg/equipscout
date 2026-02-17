# Multi-stage build for EquipScout
FROM node:20-alpine AS builder

# Install dependencies for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy root package files first
COPY package.json ./

# Copy backend package files
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install

# Copy Prisma schema and generate client
COPY backend/prisma ./backend/prisma/
RUN cd backend && npx prisma generate

# Copy backend source
COPY backend/ ./backend/

# Build backend (with relaxed TypeScript)
RUN cd backend && npm run build:prod

# Copy webapp package files
COPY webapp/package.json webapp/package-lock.json* ./webapp/
RUN cd webapp && npm install

# Copy webapp source and build
COPY webapp/ ./webapp/
RUN cd webapp && npm run build

# Production stage
FROM node:20-alpine AS production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy backend from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/prisma ./prisma

# Copy frontend build
COPY --from=builder /app/webapp/dist ./public

# Generate Prisma client in production
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]