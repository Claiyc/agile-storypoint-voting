# Production-ready Dockerfile for static Nuxt 3 site

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --frozen-lockfile && npx nuxi generate

# Production stage (Nginx)
FROM nginx:alpine AS runner
WORKDIR /app

# Copy generated static files to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (default for Nginx)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 