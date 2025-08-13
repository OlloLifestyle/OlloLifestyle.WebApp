# Ollo Lifestyle - WebApp & API

Modern Angular application with secure API architecture using Docker and Nginx reverse proxy.

## Architecture

- **WebApp**: Angular 20 application (port 3000, internal)
- **API**: Backend service (port 3001, internal only) 
- **Nginx**: Reverse proxy (port 80, public)

### Network Security
- API is completely isolated from public internet
- Only accessible through nginx reverse proxy
- Swagger available in development mode only

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ for local development

## Quick Start

### Production
```bash
docker-compose up -d
```
Access: http://localhost

### Development  
```bash
docker-compose up -d
```
- WebApp: http://localhost (via nginx)
- API Direct: http://localhost:3001 (with Swagger)
- Nginx logs: `./logs/nginx/`

### Local Development (without Docker)
```bash
npm install
npm run start
```
Access: http://localhost:4200

## Production Deployment

### Server Setup (One-time)

1. **Copy the setup script to your server:**
   ```bash
   scp scripts/setup-webapp-server.sh user@your-server:/tmp/
   ```

2. **Run the setup script on your server:**
   ```bash
   chmod +x /tmp/setup-webapp-server.sh
   /tmp/setup-webapp-server.sh
   ```

3. **Configure environment variables:**
   ```bash
   cd /opt/ollo-webapp
   nano .env  # Update API_BASE_URL and other settings
   ```

### GitHub Actions CI/CD Setup

1. **Add these secrets to your GitHub repository:**
   - `DOCKER_PASSWORD`: Your Docker Hub password
   - `HOST`: Your server IP address (e.g., 192.168.50.98)
   - `USERNAME`: SSH username for your server (e.g., webadmin)
   - `SSH_PRIVATE_KEY`: Private SSH key for server access
   - `PORT`: SSH port (default: 22)

2. **Update the workflow file:**
   - Edit `.github/workflows/deploy.yml`
   - Update `DOCKER_USERNAME` to your Docker Hub username
   - Verify server paths and configurations

3. **Trigger deployment:**
   - Push to `main` or `master` branch
   - Or manually trigger via GitHub Actions tab

### Manual Deployment

1. **On your server, pull and deploy:**
   ```bash
   cd ~/OlloLifestyle.WebApp
   git pull origin main
   docker build --no-cache -t dayandev/ollolifestyle-webapp:latest .
   docker-compose down
   docker-compose up -d
   ```

2. **Check deployment status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## Configuration

### Environment Variables

- `API_BASE_URL`: Base URL for your API server (default: http://192.168.50.98:8080/api)
- `NODE_ENV`: Environment (production/development)
- `WEBAPP_PORT`: Port for the webapp container (default: 3000)

### Nginx Configuration

The `nginx.conf` file includes:
- Static file serving with caching
- Gzip compression
- Security headers
- API proxy configuration
- Angular routing support

## Monitoring & Maintenance

### Health Checks

```bash
# Check webapp health
curl http://192.168.50.98:3000

# Run comprehensive health check
/opt/ollo-webapp/health-check.sh
```

### View Logs

```bash
cd /opt/ollo-webapp

# View container logs
docker-compose logs -f ollo-webapp

# View nginx access logs
tail -f logs/access.log

# View nginx error logs
tail -f logs/error.log
```

### Backup & Restore

```bash
# Create manual backup
docker-compose down
cp -r ~/OlloLifestyle.WebApp ~/OlloLifestyle.WebApp.backup.$(date +%Y%m%d)

# Rollback to previous version
git log --oneline
git reset --hard <previous-commit-hash>
docker-compose down && docker-compose up -d
```

### System Monitoring

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f

# Check resource usage
docker stats
```

## Troubleshooting

### Common Issues

1. **Container won't start:**
   ```bash
   docker-compose logs ollo-webapp
   docker-compose down && docker-compose up -d
   ```

2. **API calls failing:**
   - Check `API_BASE_URL` in `.env`
   - Verify API server is running
   - Check nginx proxy configuration

3. **Port conflicts:**
   - Change `WEBAPP_PORT` in `.env`
   - Update docker-compose.yml ports mapping

4. **Permission issues:**
   ```bash
   sudo chown -R webadmin:webadmin /opt/ollo-webapp
   ```

### Deployment Rollback

If deployment fails:
```bash
cd ~/OlloLifestyle.WebApp
git log --oneline
git reset --hard <previous-working-commit>
docker-compose down && docker-compose up -d
```

### Manual Recovery

```bash
# Stop all containers
docker-compose down

# Remove problematic containers
docker-compose rm -f

# Pull fresh images
docker-compose pull

# Start fresh
docker-compose up -d
```

## URLs

- **Production WebApp**: http://portal.ollolife.com
- **Health Check**: http://portal.ollolife.com

## Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Check container status: `docker-compose ps`
3. Verify all prerequisites are installed
4. Check GitHub Actions workflow logs
