FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files (paths relative to repo root)
COPY backend/package.json backend/bun.lock ./
COPY backend/prisma ./prisma/

# Set database URL for build (SQLite file is in prisma/)
ENV DATABASE_URL="file:./prisma/dev.db"

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Copy source and env
COPY backend/src ./src/
COPY backend/tsconfig.json ./
COPY backend/.env ./

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/.env ./

# Set database URL for runtime (SQLite file is in prisma/)
ENV DATABASE_URL="file:./prisma/dev.db"
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "start"]
