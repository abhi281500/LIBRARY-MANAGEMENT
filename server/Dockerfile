# --- Node.js Production Backend Dockerfile ---
FROM node:20-alpine AS production

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=8000

# Expose API port
EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Start Server
CMD ["node", "server.js"]
