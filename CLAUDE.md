# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm install --legacy-peer-deps` - Install dependencies (PWA requires legacy peer deps)
- `npm run start` - Start development server (http://localhost:4200)
- `npm run build` - Build for production (generates PWA files)
- `npm run watch` - Build in watch mode for development
- `npm test` - Run unit tests with Karma/Jasmine

### Testing
- Uses Jasmine testing framework with Karma test runner
- Test files follow `*.spec.ts` naming convention
- Tests are configured to run in Chrome via karma-chrome-launcher

### Docker Development
- `docker build -t ollolifestyle-webapp .` - Build Docker image
- `docker run -p 3000:80 ollolifestyle-webapp` - Run containerized app (http://localhost:3000)
- `docker-compose up -d` - Run with docker-compose
- `docker-compose logs -f ollo-webapp` - View container logs

### HTTPS/SSL Setup
- `chmod +x setup-ssl.sh && sudo ./setup-ssl.sh` - Set up free HTTPS certificates
- `chmod +x test-ssl.sh && ./test-ssl.sh` - Test HTTPS and PWA functionality
- `sudo certbot renew --dry-run` - Test certificate renewal
- `sudo certbot certificates` - View certificate information

## Project Architecture

### Framework & Structure
- **Angular 20** standalone components application using modern Angular features
- **Progressive Web App (PWA)** with full offline support and service worker
- **Standalone Components**: No NgModules, components are self-contained with their own imports
- **Signal-based**: Uses Angular's latest reactivity system
- **TypeScript 5.8** with strict type checking enabled

### Application Structure
```
src/
├── app/
│   ├── app.config.ts          # Application configuration with providers
│   ├── app.routes.ts          # Router configuration
│   ├── app.ts                 # Root component
│   └── auth/
│       └── login/             # Login component with form handling
├── main.ts                    # Bootstrap entry point
├── index.html                 # Main HTML template
└── styles.css                 # Global styles
```

### Key Architecture Patterns
- **Standalone Components**: All components use `standalone: true` and declare their own imports
- **Providers Configuration**: Application providers are configured in `app.config.ts`
- **File-based Routing**: Routes are configured in `app.routes.ts` with lazy loading support
- **Component Structure**: Each component has separate `.ts`, `.html`, and `.css` files

### Current Application State
- **Entry Point**: Login component serves as the main landing page
- **Authentication Flow**: Login form with company, user, and password fields
- **UI Features**: Parallax mouse effects, loading states, form validation
- **Demo Credentials**: company: "demo", user: "admin", password: "password"

### Styling & Assets
- **FontAwesome 6.7.2** for icons (loaded via CDN in angular.json)
- **CSS Custom Properties**: Uses modern CSS features
- **Assets**: Logo, SVG icons, and images stored in `/assets` and `/public` directories
- **Responsive Design**: Mobile-first approach with modern CSS Grid/Flexbox

### Dependencies & Libraries
- **Core Angular**: @angular/core, @angular/common, @angular/forms, @angular/router
- **PWA Support**: @angular/service-worker, @angular/pwa for offline functionality
- **Testing**: Jasmine, Karma with Chrome launcher
- **Build System**: Angular CLI with @angular/build
- **Icons**: FontAwesome Free 6.7.2

### PWA Features
- **Service Worker**: Automatic caching and offline support via Angular Service Worker
- **App Manifest**: Installable app with custom icons and branding
- **Offline Sync**: Queues API requests when offline and syncs when back online
- **Cache Strategies**: Fresh-first for critical data, cache-first for static assets
- **Update Notifications**: Automatic update detection with user prompts
- **Install Prompts**: Native app installation prompts on supported devices
- **Network Status**: Real-time online/offline status indicators

### TypeScript Configuration
- **Strict Mode**: All strict TypeScript options enabled
- **Target**: ES2022 with modern JavaScript features
- **Module System**: ESM with tree-shaking support
- **Angular Compiler**: Strict templates and injection parameters

## Multi-Service Architecture

### Service Separation
- **WebApp Project**: This repository (Angular frontend + Nginx proxy)
- **API Project**: Separate repository (`OlloLifestyle.Webapi`) running independently
- **Network Integration**: Both projects connect via shared Docker network `ollo-lifestyle-webapp_frontend`

### Production Architecture
- **Public Domain**: `https://portal.ollolife.com` (port 443) - WebApp with SSL/TLS
- **HTTP Redirect**: `http://portal.ollolife.com` (port 80) - Redirects to HTTPS
- **Internal API**: `http://192.168.50.98:8080/api/` - API access (internal network only)
- **Swagger UI**: `http://192.168.50.98:8080/swagger` - API documentation (internal network only)
- **Nginx Routing**: Single nginx handles HTTPS termination, WebApp serving, and API proxying

### Container Network Setup
```yaml
# WebApp containers connect to network:
networks:
  frontend:
    driver: bridge

# API project must use external network:
networks:
  frontend:
    external: true
    name: ollo-lifestyle-webapp_frontend
```

### Nginx Proxy Configuration
- **Port 443**: HTTPS WebApp serving with SSL/TLS termination.
- **Port 80**: HTTP to HTTPS redirect for public domain
- **Port 8080**: Routes `/api/` and `/swagger` to separate API container
- **SSL/TLS**: Let's Encrypt free certificates with auto-renewal
- **Security**: Enhanced security headers, HSTS, and internal network restrictions
- **HTTP/2**: Enabled for better performance over HTTPS
- **API Upstream**: Points to `ollo-api:5000` container from separate project

## Deployment

### Production Deployment
- **Docker Hub**: Automated builds push to Docker registry
- **Production URL**: https://portal.ollolife.com (HTTPS with SSL)
- **API Access**: http://192.168.50.98:8080/api (internal only)
- **Server Setup**: Uses Docker Compose with Nginx reverse proxy and SSL termination
- **SSL Certificates**: Free Let's Encrypt certificates with auto-renewal
- **Environment Variables**: Configure API_BASE_URL, NODE_ENV in `.env`

### SSL/HTTPS Setup
- **Certificate Provider**: Let's Encrypt (free, automated)
- **Certificate Path**: `/etc/letsencrypt/live/portal.ollolife.com/`
- **Auto-renewal**: Configured via cron job (runs twice daily)
- **Protocols**: TLS 1.2 and 1.3 for maximum security
- **Security Headers**: HSTS, CSP, and other security enhancements

### Multi-Project Deployment Order
1. **Start WebApp first**: `docker-compose up -d` (creates shared network)
2. **Start API second**: In API project directory, `docker-compose up -d` (joins existing network)
3. **Verify networking**: Both containers should appear in `docker network inspect ollo-lifestyle-webapp_frontend`

### Container Dependencies
- **WebApp nginx** expects `ollo-api:5000` container to exist for API routing
- **API container** must use external network created by WebApp
- **Network isolation** ensures API is only accessible through nginx proxy

### Monitoring & Maintenance
- **Health Checks**: Built-in health check endpoints for both services
- **Logging**: Nginx access/error logs in `./logs/nginx/`
- **Container Status**: Monitor both projects with `docker ps`
- **API Health**: `curl http://localhost:8080/api/health` returns "Healthy"

### CI/CD
- **Separate Deployments**: Each project deploys independently
- **Network Dependency**: WebApp must be running first to create shared network
- **GitHub Actions**: Configured for WebApp automated deployment

## Development Guidelines

### Component Development
- Always use standalone components with explicit imports
- Follow Angular's reactive patterns and lifecycle hooks
- Use Angular Forms (FormsModule) for form handling
- Implement proper TypeScript typing for all properties and methods

### Code Style
- Strict TypeScript configuration enforced
- Use Angular's naming conventions (PascalCase for components, camelCase for properties)
- Separate concerns: component logic, template, and styles in separate files
- Follow Angular's style guide for component architecture

### Testing Requirements
- Unit tests for all components using Jasmine/Karma
- Test files should be co-located with components (`*.spec.ts`)
- Run `npm test` before committing changes
- Ensure all tests pass in CI/CD pipeline.