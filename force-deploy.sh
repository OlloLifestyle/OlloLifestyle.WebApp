#!/bin/bash

# Force deployment script for environment file updates
# This script ensures new environment files are included in Docker builds

echo "🚀 Starting force deployment with environment file updates..."

# Step 1: Pull latest code (if not already done)
echo "📥 Pulling latest code from origin..."
git pull origin main

# Step 2: Stop all containers
echo "🛑 Stopping all containers..."
docker-compose down

# Step 3: Remove old images to force rebuild
echo "🗑️ Removing old Docker images to force rebuild..."
docker rmi dayandev/ollolifestyle-webapp:latest -f || echo "Image not found, continuing..."
docker rmi ollolifestyle-webapp:latest -f || echo "Local image not found, continuing..."

# Step 4: Clean Docker build cache
echo "🧹 Cleaning Docker build cache..."
docker builder prune -f

# Step 5: Rebuild with no cache
echo "🔨 Building new Docker image with no cache..."
docker-compose build --no-cache

# Step 6: Start containers
echo "🚀 Starting containers with new build..."
docker-compose up -d

# Step 7: Verify deployment
echo "✅ Verifying deployment..."
sleep 10
docker ps

echo "🏁 Force deployment completed!"
echo "📝 Check logs with: docker-compose logs -f ollo-webapp"
echo "🌐 Access app at: http://localhost:3000"