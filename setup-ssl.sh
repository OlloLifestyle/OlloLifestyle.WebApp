#!/bin/bash
set -e
echo "Setting up HTTPS for Ollo Lifestyle Portal"

DOMAIN="portal.ollolife.com"
EMAIL="dayan@ollolife.com"

echo "Stopping Docker containers first..."
cd /home/olloadmin/OlloLifestyle.WebApp/
docker-compose down

echo "Installing Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

echo "Generating SSL certificate..."
certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN \
    --domains www.$DOMAIN

echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 2,14 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "Starting containers with HTTPS..."
docker-compose up -d

echo "HTTPS setup complete!"
echo "Your site: https://$DOMAIN"

sleep 5
echo "Testing HTTPS..."
if curl -I https://$DOMAIN --connect-timeout 10; then
    echo "HTTPS is working!"
else
    echo "HTTPS test failed - may need time to start"
fi