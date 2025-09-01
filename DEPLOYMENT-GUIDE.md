# Deployment Guide - Environment Files Update

## Problem
Your server isn't picking up new environment files because Docker is using cached layers from previous builds. The CI/CD deployed the code to origin, but your local Docker deployment is still using old cached images.

## Root Cause
- Docker caches build layers and doesn't rebuild when only source files change
- The `docker-compose build` might use cached layers that don't include new environment files
- Angular's environment file replacement wasn't configured properly

## Solution

### 1. Immediate Fix (Run This Now)

**For Windows:**
```bash
# Run the force deployment script
./force-deploy.bat
```

**For Linux/Mac:**
```bash
# Make script executable and run
chmod +x force-deploy.sh
./force-deploy.sh
```

### 2. Manual Steps (If Scripts Don't Work)

```bash
# Step 1: Pull latest code
git pull origin main

# Step 2: Stop all containers
docker-compose down

# Step 3: Remove old images (force rebuild)
docker rmi dayandev/ollolifestyle-webapp:latest -f
docker rmi ollolifestyle-webapp:latest -f

# Step 4: Clear build cache
docker builder prune -f

# Step 5: Build with no cache
docker-compose build --no-cache

# Step 6: Start containers
docker-compose up -d

# Step 7: Verify
docker ps
docker-compose logs -f ollo-webapp
```

### 3. Verify Environment Configuration

Check if the right environment is loaded:
```bash
# Access the running container
docker exec -it ollo-webapp /bin/sh

# Check built files (should contain docker environment config)
ls -la /usr/share/nginx/html/
cat /usr/share/nginx/html/main-*.js | grep "api.*baseUrl" || echo "Config not found in main bundle"
```

### 4. Build Configurations Explained

| Environment | Command | API URL |
|-------------|---------|---------|
| Development | `npm run start` | `https://localhost:44380/api` |
| Production | `npm run build -- --configuration=production` | `http://192.168.50.98:8080/api` |
| Docker | `npm run build -- --configuration=docker` | `/api` (nginx proxy) |

### 5. Environment Files

- `src/environments/environment.ts` - Development (default)
- `src/environments/environment.prod.ts` - Production server
- `src/environments/environment.docker.ts` - Docker containers

### 6. Angular Configuration

The `angular.json` has been updated with:
- `fileReplacements` for production and docker builds
- Proper environment file swapping during build

### 7. Dockerfile Changes

Updated to use Docker-specific configuration:
```dockerfile
RUN npm run build -- --configuration=docker
```

## Troubleshooting

### If Environment Still Not Updated:
1. Check if Docker Desktop is running
2. Verify git pull brought the latest files
3. Run `docker system prune -a` (removes ALL unused images)
4. Rebuild from scratch: `docker-compose build --no-cache --pull`

### Verify Configuration Loading:
```typescript
// In browser console or component
console.log('Current API Base URL:', environment.api.baseUrl);
console.log('Production Mode:', environment.production);
```

### Check Network Configuration:
```bash
# Verify nginx proxy is routing correctly
docker exec -it nginx-proxy nginx -t
docker-compose logs nginx-proxy
```

## Prevention

To prevent this issue in the future:
1. Always use `--no-cache` flag when testing environment changes
2. Use the deployment scripts provided
3. Verify environment loading after each deployment
4. Monitor Docker build logs for file replacement messages

## Next Steps

After deployment succeeds:
1. Test API connectivity: Check browser network tab for API calls
2. Verify error handling: Trigger an API error to test the new error handling system
3. Check configuration: Ensure ConfigService is returning correct values
4. Monitor logs: Watch for any configuration-related errors