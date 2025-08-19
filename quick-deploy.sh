#!/bin/bash

# Quick deployment script for minor updates
# Skips git pull if you've already updated locally

echo "⚡ Quick deployment starting..."

cd ~/OlloLifestyle.WebApp

echo "🔨 Building image..."
docker build --no-cache -t dayandev/ollolifestyle-webapp:latest .

echo "🔄 Restarting services..."
docker-compose down
docker-compose up -d

echo "✅ Quick deployment complete!"
docker exec ollo-webapp ls /usr/share/nginx/html/ | grep "main-.*\.js"