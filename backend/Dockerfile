FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files (paths relative to repo root)
COPY backend/package.json backend/bun.lock ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Copy source
COPY backend/src ./src/
COPY backend/tsconfig.json ./

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./

# Generate Prisma client in production
RUN bunx prisma generate

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "start"]
