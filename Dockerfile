# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy webapp files
COPY webapp/package*.json ./
RUN npm ci

COPY webapp/ ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist

# Install serve globally
RUN npm install -g serve

# Use Railway's $PORT env var
ENV PORT=3000
EXPOSE 3000

CMD serve -s dist -l 0.0.0.0:$PORT
