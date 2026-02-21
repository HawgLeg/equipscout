FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci && npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy built assets
COPY --from=builder /app/dist ./dist

# Install serve
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000"]
