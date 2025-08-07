#!/bin/bash

# OlloLifestyle Angular WebApp Server Setup Script
# Run this script on your Linux server to set up the Angular webapp deployment environment

set -e

# Configuration
SERVER_NAME="OLLO-WEBAPP-SVR"
APP_USER="webadmin"
APP_DIR="/opt/ollo-webapp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root. Please run as $APP_USER user."
   exit 1
fi

log_info "Starting OlloLifestyle Angular WebApp Server Setup..."

# Create application directory structure
log_info "Creating application directory structure..."
sudo mkdir -p $APP_DIR/{logs,backups,nginx/{logs,conf}}
sudo chown -R $APP_USER:$APP_USER $APP_DIR
chmod 755 $APP_DIR

# Configure firewall for webapp
log_info "Configuring firewall for webapp..."
sudo ufw allow 3000/tcp  # Angular webapp port
sudo ufw reload

# Create docker-compose.yml for webapp
log_info "Creating docker-compose.yml..."
cat > $APP_DIR/docker-compose.yml <<EOF
version: '3.8'

services:
  ollo-webapp:
    image: dayandev/ollolifestyle-webapp:latest
    container_name: ollo-webapp
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/var/log/nginx
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  webapp-network:
    driver: bridge

volumes:
  logs:
    driver: local
EOF

# Create environment file
log_info "Creating environment configuration..."
cat > $APP_DIR/.env <<EOF
# Angular WebApp Environment Configuration
NODE_ENV=production
PORT=3000
API_BASE_URL=http://192.168.50.98:8080/api
IMAGE_TAG=latest
EOF

# Create health check script
log_info "Creating health check script..."
cat > $APP_DIR/health-check.sh <<'EOF'
#!/bin/bash

# Health check script for Angular WebApp
HEALTH_ENDPOINT="http://localhost:3000"
MAX_ATTEMPTS=30
ATTEMPT=1

echo "Starting health check for Angular WebApp..."

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "Health check attempt $ATTEMPT/$MAX_ATTEMPTS..."
    
    if curl -f -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
        echo "✅ WebApp is healthy!"
        echo "🔗 WebApp accessible at: http://192.168.50.98:3000"
        exit 0
    fi
    
    echo "❌ Health check failed, waiting 10 seconds..."
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
done

echo "❌ Health check failed after $MAX_ATTEMPTS attempts"
echo "📋 Checking container status..."
docker-compose ps

echo "📋 Checking logs..."
docker-compose logs --tail=20 ollo-webapp

exit 1
EOF

chmod +x $APP_DIR/health-check.sh

# Create systemd service for auto-start
log_info "Creating systemd service..."
sudo tee /etc/systemd/system/ollo-webapp.service > /dev/null <<EOF
[Unit]
Description=OlloLifestyle Angular WebApp
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$APP_USER
Group=$APP_USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ollo-webapp.service

# Create backup script
log_info "Creating backup script..."
cat > $APP_DIR/backup.sh <<'EOF'
#!/bin/bash

# Angular WebApp Backup Script
BACKUP_DIR="/opt/ollo-webapp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ollo-webapp-backup-$DATE.tar.gz"

mkdir -p $BACKUP_DIR

tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude="$BACKUP_DIR" \
    --exclude="*.log" \
    --exclude="logs/" \
    --exclude="node_modules" \
    /opt/ollo-webapp/

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t ollo-webapp-backup-*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup created: $BACKUP_FILE"
EOF

chmod +x $APP_DIR/backup.sh

# Set up cron job for automated backups
log_info "Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 3 * * * $APP_DIR/backup.sh >> $APP_DIR/logs/backup.log 2>&1") | crontab -

# Create monitoring script
cat > $APP_DIR/monitor.sh <<'EOF'
#!/bin/bash

echo "=== OlloLifestyle Angular WebApp Status ==="
echo "Date: $(date)"
echo ""

echo "🐳 Container Status:"
cd /opt/ollo-webapp
docker-compose ps
echo ""

echo "🔍 Health Check:"
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ WebApp is healthy"
else
    echo "❌ WebApp health check failed"
fi
echo ""

echo "💾 Disk Usage:"
df -h /opt/ollo-webapp
echo ""

echo "📊 System Load:"
uptime
echo ""

echo "🔗 Network Status:"
ss -tulpn | grep -E ":3000\b"
echo ""
EOF

chmod +x $APP_DIR/monitor.sh

log_info "Angular WebApp server setup completed successfully! 🎉"
echo ""
log_info "Next steps:"
echo "1. Update the API_BASE_URL in .env if needed:"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Test the setup:"
echo "   cd $APP_DIR"
echo "   docker-compose up -d"
echo "   ./health-check.sh"
echo ""
echo "3. Monitor the webapp:"
echo "   ./monitor.sh"
echo ""
echo "📂 Application directory: $APP_DIR"
echo "📄 Logs location: $APP_DIR/logs"
echo "💾 Backups location: $APP_DIR/backups"
echo "🔗 WebApp will be accessible at: http://192.168.50.98:3000"