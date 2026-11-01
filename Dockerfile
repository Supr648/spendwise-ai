# Multi-stage Docker build for SpendWise AI Production Deployment

# Stage 1: Build Frontend Single Page Application
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server code
COPY server/ ./server/

# Copy compiled frontend from Stage 1 into server/client/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port (default 5001)
EXPOSE 5001

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

# Start server
CMD ["node", "server/src/server.js"]

