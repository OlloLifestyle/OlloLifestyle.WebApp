@echo off
REM Force deployment script for Windows
REM This script ensures new environment files are included in Docker builds

echo 🚀 Starting force deployment with environment file updates...

REM Step 1: Pull latest code (if not already done)
echo 📥 Pulling latest code from origin...
git pull origin main

REM Step 2: Stop all containers
echo 🛑 Stopping all containers...
docker-compose down

REM Step 3: Remove old images to force rebuild
echo 🗑️ Removing old Docker images to force rebuild...
docker rmi dayandev/ollolifestyle-webapp:latest -f 2>nul || echo Image not found, continuing...
docker rmi ollolifestyle-webapp:latest -f 2>nul || echo Local image not found, continuing...

REM Step 4: Clean Docker build cache
echo 🧹 Cleaning Docker build cache...
docker builder prune -f

REM Step 5: Rebuild with no cache
echo 🔨 Building new Docker image with no cache...
docker-compose build --no-cache

REM Step 6: Start containers
echo 🚀 Starting containers with new build...
docker-compose up -d

REM Step 7: Verify deployment
echo ✅ Verifying deployment...
timeout /t 10 /nobreak > nul
docker ps

echo 🏁 Force deployment completed!
echo 📝 Check logs with: docker-compose logs -f ollo-webapp
echo 🌐 Access app at: http://localhost:3000

pause