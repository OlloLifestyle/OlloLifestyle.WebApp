# Angular Web App Deployment Guide

## Prerequisites on Linux Server

1. **Install Docker and Docker Compose**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Logout and login again to apply group changes
```

2. **Install Git** (if not already installed):
```bash
sudo apt install git -y
```

## Deployment Steps

### Step 1: Clone Repository (First Time)
```bash
# Clone the repository
git clone https://github.com/OlloLifestyle/OlloLifestyle.WebApp.git
cd OlloLifestyle.WebApp
```

### Step 2: Set Environment Variables
```bash
# Create environment file
cat << EOF > .env
API_BASE_URL=http://your-api-server:port/api
NODE_ENV=production
EOF
```

### Step 3: Deploy with Docker Compose
```bash
# Pull latest image and start services
docker-compose pull
docker-compose up -d

# Check if containers are running
docker-compose ps
```

### Step 4: Verify Deployment
```bash
# Check logs
docker-compose logs -f ollo-webapp

# Test the application
curl http://localhost:3000
```

## Update Deployment (After Changes)

### Option 1: Using Docker Hub (Recommended)
```bash
# Navigate to project directory
cd /path/to/OlloLifestyle.WebApp

# Pull latest image
docker-compose pull

# Restart services
docker-compose up -d

# Clean up old images
docker image prune -f
```

### Option 2: Build Locally
```bash
# Navigate to project directory
cd /path/to/OlloLifestyle.WebApp

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Clean up old images
docker image prune -f
```

## GitHub Secrets Configuration

To enable automatic Docker Hub deployment, add these secrets to your GitHub repository:

1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Add these repository secrets:
   - `DOCKER_USERNAME`: dayandev
   - `DOCKER_PASSWORD`: Ollo@123#2025

## Useful Commands

### Monitor Application
```bash
# View logs
docker-compose logs -f ollo-webapp

# Check container status
docker-compose ps

# Check container resource usage
docker stats ollo-webapp
```

### Backup and Restore
```bash
# Backup logs
sudo cp -r ./logs /backup/ollo-webapp-logs-$(date +%Y%m%d)

# View nginx access logs
tail -f ./logs/access.log

# View nginx error logs
tail -f ./logs/error.log
```

### Troubleshooting
```bash
# Restart application
docker-compose restart ollo-webapp

# Stop all services
docker-compose down

# Start fresh (removes containers)
docker-compose down -v
docker-compose up -d

# Check available disk space
df -h

# Clean Docker system
docker system prune -af
```

## Firewall Configuration

If using ufw firewall:
```bash
# Allow HTTP traffic
sudo ufw allow 3000/tcp

# Check firewall status
sudo ufw status
```

## SSL/HTTPS Setup (Optional)

To add SSL certificate, modify nginx.conf and docker-compose.yml:

1. Mount SSL certificates in docker-compose.yml
2. Update nginx.conf to handle SSL
3. Use Let's Encrypt with certbot for free certificates

## Environment-Specific Configuration

Update the API_BASE_URL in your environment file or nginx.conf depending on your API server location:
- Development: `http://localhost:8080/api`
- Production: `http://your-production-api:8080/api`