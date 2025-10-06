## Production-ready Dockerfile for static Nuxt 3 SPA

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Use npm ci for reproducible installs
RUN npm ci
COPY . .
# Generate static SPA to /app/dist using project script
RUN npm run generate

# Production stage (Nginx)
FROM nginx:alpine AS runner
WORKDIR /app

# Copy generated static files to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (default for Nginx)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]