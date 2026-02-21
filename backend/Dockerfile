# Multi-stage build for EquipScout
FROM node:20-alpine AS base

# Install dependencies
RUN apk add --no-cache openssl

WORKDIR /app

# Copy backend files
COPY package.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy backend source
COPY src ./src/
COPY tsconfig.json ./

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

# Copy from builder
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/src ./src
COPY --from=base /app/package.json ./
COPY --from=base /app/tsconfig.json ./

# Generate Prisma client in production
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start with npm start (runs migrations + seed + tsx)
CMD ["npm", "start"]