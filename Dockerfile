# Multi-stage build for Angular app with Nginx
# Stage 1: Build the Angular application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using legacy peer deps to handle PWA version conflicts)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular app
RUN npm run build

# Stage 2: Serve with Node.js serve
FROM node:20-alpine

# Install serve globally
RUN npm install -g serve

# Copy built app from previous stage (includes PWA files)
COPY --from=build /app/dist/OlloLifestyle.WebApp/browser /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S angular -u 1001

# Change ownership of the app directory
RUN chown -R angular:nodejs /usr/share/nginx/html
USER angular

# Expose port 3000 for internal communication
EXPOSE 3000

# Start the app with serve
CMD ["serve", "-s", "/usr/share/nginx/html", "-l", "3000"]  
