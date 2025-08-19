#!/bin/bash

# Quick deployment script for minor updates
# Skips git pull if you've already updated locally

echo "⚡ Quick deployment starting..."

cd ~/OlloLifestyle.WebApp

echo "🔄 Stopping containers..."
docker-compose down

echo "🗑️ Removing old images..."
docker rmi dayandev/ollolifestyle-webapp:latest 2>/dev/null || echo "No old image to remove"

echo "🔨 Building and starting..."
docker-compose up -d --build

echo "✅ Quick deployment complete!"
docker exec ollo-webapp ls /usr/share/nginx/html/ | grep "main-.*\.js"