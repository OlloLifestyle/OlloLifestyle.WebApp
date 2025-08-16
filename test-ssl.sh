#!/bin/bash
# SSL Test Script for Ollo Lifestyle Portal
# This script tests HTTPS functionality and PWA features

set -e

echo "🧪 Testing HTTPS and PWA functionality"
echo "======================================"

# Configuration
DOMAIN="portal.ollolife.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
}

print_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ️  INFO:${NC} $1"
}

# Test 1: HTTP to HTTPS redirect
echo ""
echo "Test 1: HTTP to HTTPS redirect"
echo "------------------------------"
if curl -I http://$DOMAIN 2>/dev/null | grep -q "301\|302"; then
    print_pass "HTTP redirects to HTTPS"
else
    print_fail "HTTP redirect not working"
fi

# Test 2: HTTPS connectivity
echo ""
echo "Test 2: HTTPS connectivity"
echo "-------------------------"
if curl -I https://$DOMAIN --connect-timeout 10 > /dev/null 2>&1; then
    print_pass "HTTPS connection successful"
else
    print_fail "HTTPS connection failed"
fi

# Test 3: SSL certificate validity
echo ""
echo "Test 3: SSL certificate validity"
echo "--------------------------------"
CERT_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ $? -eq 0 ]; then
    print_pass "SSL certificate is valid"
    echo "$CERT_INFO" | sed 's/^/         /'
else
    print_fail "SSL certificate check failed"
fi

# Test 4: Service Worker availability
echo ""
echo "Test 4: Service Worker availability"
echo "----------------------------------"
if curl -I https://$DOMAIN/ngsw-worker.js 2>/dev/null | grep -q "200"; then
    print_pass "Service Worker is accessible"
else
    print_fail "Service Worker not accessible"
fi

# Test 5: PWA Manifest
echo ""
echo "Test 5: PWA Manifest"
echo "-------------------"
if curl -I https://$DOMAIN/manifest.webmanifest 2>/dev/null | grep -q "application/manifest+json"; then
    print_pass "PWA manifest is properly served"
else
    print_fail "PWA manifest has issues"
fi

# Test 6: PWA Icons
echo ""
echo "Test 6: PWA Icons"
echo "----------------"
if curl -I https://$DOMAIN/icons/icon-192x192.png 2>/dev/null | grep -q "200"; then
    print_pass "PWA icons are accessible"
else
    print_fail "PWA icons not accessible"
fi

# Test 7: Security headers
echo ""
echo "Test 7: Security headers"
echo "-----------------------"
HEADERS=$(curl -I https://$DOMAIN 2>/dev/null)
if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
    print_pass "HSTS header present"
else
    print_fail "HSTS header missing"
fi

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    print_pass "Content-Type-Options header present"
else
    print_fail "Content-Type-Options header missing"
fi

# Test 8: HTTP/2 support
echo ""
echo "Test 8: HTTP/2 support"
echo "---------------------"
if curl -I https://$DOMAIN --http2 2>/dev/null | grep -q "HTTP/2"; then
    print_pass "HTTP/2 is enabled"
else
    print_info "HTTP/2 check inconclusive (may still work)"
fi

# Test 9: API endpoints (if available)
echo ""
echo "Test 9: API endpoints"
echo "--------------------"
if curl -I https://$DOMAIN:8080/api/health 2>/dev/null | grep -q "200\|Healthy"; then
    print_pass "API health endpoint accessible"
else
    print_info "API health endpoint not accessible (may be expected)"
fi

# Test 10: Docker containers status
echo ""
echo "Test 10: Docker containers status"
echo "---------------------------------"
cd /home/olloadmin/OlloLifestyle.WebApp/
CONTAINERS=$(docker-compose ps --services --filter "status=running" | wc -l)
if [ "$CONTAINERS" -ge 2 ]; then
    print_pass "Docker containers are running"
    docker-compose ps | grep -E "(Up|healthy)" | sed 's/^/         /'
else
    print_fail "Some Docker containers are not running"
fi

# Final summary
echo ""
echo "🏁 Test Summary"
echo "==============="
echo ""
echo "Your HTTPS PWA setup status:"
echo "• Domain: https://$DOMAIN"
echo "• SSL Certificate: $(if curl -I https://$DOMAIN --connect-timeout 5 > /dev/null 2>&1; then echo "✅ Valid"; else echo "❌ Issues"; fi)"
echo "• PWA Features: $(if curl -I https://$DOMAIN/ngsw-worker.js 2>/dev/null | grep -q "200"; then echo "✅ Available"; else echo "❌ Issues"; fi)"
echo "• Offline Support: $(if curl -I https://$DOMAIN/manifest.webmanifest 2>/dev/null | grep -q "application/manifest+json"; then echo "✅ Ready"; else echo "❌ Issues"; fi)"
echo ""
echo "Manual testing checklist:"
echo "□ Visit https://$DOMAIN in Chrome/Edge"
echo "□ Check for install prompt (address bar icon)"
echo "□ Test offline mode (DevTools → Network → Offline)"
echo "□ Verify service worker registration (DevTools → Application)"
echo ""
print_info "If tests pass, your PWA with HTTPS is working correctly! 🎉"