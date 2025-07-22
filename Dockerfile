# Production-ready multi-stage Dockerfile for Nuxt 3 app

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --frozen-lockfile && npm run build

# Production stage (Nginx)
FROM nginx:alpine AS runner
WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/.output/public /usr/share/nginx/html
COPY --from=builder /app/.output /app/.output

# Copy custom nginx config (if exists)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 3000 for compatibility (can be changed)
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 