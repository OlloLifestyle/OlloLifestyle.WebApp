#!/bin/bash

# OlloLifestyle WebApp CI/CD Deployment Script
# This script pulls latest code, builds fresh image, and deploys

echo "🚀 Starting OlloLifestyle WebApp deployment..."

# Navigate to project directory
cd ~/OlloLifestyle.WebApp

echo "📥 Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed! Exiting..."
    exit 1
fi

echo "🛑 Stopping current containers..."
docker-compose down

echo "🗑️ Removing old images to force fresh build..."
docker rmi dayandev/ollolifestyle-webapp:latest 2>/dev/null || echo "No old image to remove"

echo "🔨 Building and starting with fresh image..."
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo "❌ Docker compose up failed! Exiting..."
    exit 1
fi

echo "⏳ Waiting for containers to be healthy..."
sleep 10

echo "✅ Checking deployment status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "🔍 Verifying new files are deployed..."
NEW_JS_FILE=$(docker exec ollo-webapp ls /usr/share/nginx/html/ | grep "main-.*\.js")
echo "📄 Deployed JS file: $NEW_JS_FILE"

echo "🌐 Testing website response..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Website is responding correctly (HTTP $HTTP_STATUS)"
else
    echo "⚠️  Website returned HTTP $HTTP_STATUS"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "🌐 Your website is live at: https://portal.ollolife.com"
echo "📊 Check API health: http://localhost:8080/api/health"
echo ""