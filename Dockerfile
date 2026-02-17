# Multi-stage build for EquipScout
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install

# Copy backend source
COPY backend/ ./backend/

# Build backend
RUN cd backend && npm run build

# Copy webapp package files
COPY webapp/package.json webapp/package-lock.json* ./webapp/
RUN cd webapp && npm install

# Copy webapp source and build
COPY webapp/ ./webapp/
RUN cd webapp && npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy backend from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/prisma ./prisma

# Copy frontend build
COPY --from=builder /app/webapp/dist ./public

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]