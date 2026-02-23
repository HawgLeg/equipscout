FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Copy source
COPY . .

# Build (if needed)
RUN bun run build || true

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production
RUN bunx prisma generate

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "start"]
