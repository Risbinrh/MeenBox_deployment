# Use Node.js 20 LTS as base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev) for build
RUN npm install && \
    npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Debug: Check what was built
RUN echo "=== Checking build output ===" && \
    ls -la .medusa/ && \
    echo "=== Admin build ===" && \
    ls -la .medusa/admin/ 2>/dev/null || echo "No admin directory" && \
    echo "=== Server build ===" && \
    ls -la .medusa/server/ 2>/dev/null || echo "No server directory"

# Prune dev dependencies after build
RUN npm prune --omit=dev

# Production stage
FROM base AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# Copy necessary files from builder
COPY --from=builder --chown=medusa:nodejs /app/.medusa ./.medusa
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.js ./
COPY --from=builder --chown=medusa:nodejs /app/package*.json ./
COPY --from=builder --chown=medusa:nodejs /app/node_modules ./node_modules

# Copy admin build to expected location
COPY --from=builder --chown=medusa:nodejs /app/.medusa/server/public ./public

# Switch to non-root user
USER medusa

# Expose the port Medusa runs on (Render will set PORT env var)
EXPOSE 9000

# Health check (use PORT env var or default to 9000)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "const port = process.env.PORT || 9000; require('http').get('http://localhost:' + port + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
