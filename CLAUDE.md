# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm install --legacy-peer-deps` - Install dependencies (PWA requires legacy peer deps)
- `npm run start` - Start development server (http://localhost:4200)
- `npm run build` - Build for production (generates PWA files)
- `npm run watch` - Build in watch mode for development
- `npm test` - Run unit tests with Karma/Jasmine

### Tailwind Development
- `npx tailwindcss -i ./src/styles.css -o ./dist/output.css --watch` - Watch mode for Tailwind compilation
- `npm run build:css` - Build optimized Tailwind CSS for production
- Tailwind utilities are automatically processed during Angular build pipeline

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
│   ├── core/                  # Core services and infrastructure
│   │   ├── guards/           # Route guards (auth.guard.ts)
│   │   ├── interceptors/     # HTTP interceptors (auth, offline)
│   │   ├── models/           # Core data models
│   │   └── services/         # Core services (auth, database, offline, push-notification)
│   ├── shared/               # Shared components and utilities
│   │   ├── components/       # Reusable components (mega-menu, offline-status, unauthorized)
│   │   └── models/           # Shared data models
│   └── modules/              # Feature modules
│       ├── login/            # Login component with form handling
│       └── dashboard/        # Main dashboard component
├── main.ts                    # Bootstrap entry point
├── index.html                 # Main HTML template
└── styles.css                 # Global styles with Tailwind imports
```

### Key Architecture Patterns
- **Standalone Components**: All components use `standalone: true` and declare their own imports
- **Providers Configuration**: Application providers are configured in `app.config.ts`
- **File-based Routing**: Routes are configured in `app.routes.ts` with lazy loading support
- **Component Structure**: Each component has separate `.ts`, `.html`, and `.css` files

### Current Application State
- **Entry Point**: Login component serves as the main landing page
- **Authentication Flow**: Login form with company, user, and password fields with JWT-based authentication
- **Navigation**: Mega menu component with animated dropdowns and responsive mobile menu
- **Dashboard**: Main application dashboard with sidebar navigation
- **UI Features**: Advanced animations using Angular Animations API, custom Tailwind keyframes
- **Offline Support**: Full offline synchronization with local IndexedDB storage via Dexie
- **Demo Credentials**: company: "demo", user: "admin", password: "password"

### Styling & Assets
- **Tailwind CSS 3.4+** for utility-first styling with JIT compilation
- **Tailwind Animations**: Built-in animation utilities (animate-spin, animate-pulse, animate-bounce, etc.)
- **Custom Animations**: Extended animation configurations in tailwind.config.js
- **FontAwesome 6.7.2** for icons (loaded via CDN in angular.json)
- **CSS Custom Properties**: Uses modern CSS features alongside Tailwind utilities
- **Assets**: Logo, SVG icons, and images stored in `/assets` and `/public` directories
- **Responsive Design**: Mobile-first approach using Tailwind breakpoints (sm:, md:, lg:, xl:, 2xl:)

### Dependencies & Libraries
- **Core Angular**: @angular/core, @angular/common, @angular/forms, @angular/router, @angular/animations
- **Tailwind CSS**: tailwindcss for utility-first styling with custom animations and themes
- **PWA Support**: @angular/service-worker for offline functionality and caching
- **Database**: Dexie (IndexedDB wrapper) for local data storage and offline sync
- **Testing**: Jasmine, Karma with Chrome launcher
- **Build System**: Angular CLI with @angular/build
- **Icons**: FontAwesome Free 6.7.2

### Tailwind CSS Configuration
- **JIT Mode**: Just-in-time compilation for optimal bundle size
- **Custom Theme**: Extended color palette including oxford-blue, peach, and green brand colors
- **Advanced Animations**: 15+ custom keyframe animations including mesh gradients, orb floating, particle effects
- **Custom Keyframes**: meshGradient1/2, orbFloat1-4, gridMove, particleDrift, textShimmer, logoFloat, etc.
- **Responsive Design**: Mobile-first breakpoint system (sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px)
- **Animation Performance**: Hardware-accelerated transforms with GPU optimization

### Tailwind Animation System
- **Built-in Animations**: animate-spin, animate-ping, animate-pulse, animate-bounce
- **Custom Animations**: Defined in tailwind.config.js extending the animation theme
- **Transition Utilities**: transition-all, transition-colors, transition-opacity with duration controls
- **Transform Utilities**: scale, rotate, translate, skew with hover and focus states
- **Motion Preferences**: Respects prefers-reduced-motion for accessibility
- **Performance**: Hardware-accelerated transforms using GPU layers

### PWA Features
- **Service Worker**: Automatic caching and offline support via Angular Service Worker
- **App Manifest**: Installable app with custom icons and branding (manifest.json)
- **Offline Sync**: Queues API requests when offline and syncs when back online
- **Cache Strategies**: Fresh-first for critical data, cache-first for static assets
- **Update Notifications**: Automatic update detection with user prompts
- **Install Prompts**: Native app installation prompts on supported devices
- **Network Status**: Real-time online/offline status indicators
- **Background Sync**: Retry failed requests automatically when connection restored
- **Push Notifications**: Framework ready for push messaging (Angular service worker)
- **App Shell Architecture**: Instant loading with cached application shell
- **Precaching**: Critical resources cached during service worker installation

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

### Tailwind CSS Development Guidelines
- **Utility-First Approach**: Prefer Tailwind utilities over custom CSS
- **Component Extraction**: Use @apply directive for repeated utility patterns
- **Responsive Design**: Use mobile-first breakpoint prefixes (sm:, md:, lg:, xl:, 2xl:)
- **State Variants**: Leverage hover:, focus:, active:, disabled: modifiers
- **Animation Best Practices**: Use transition utilities with transform for smooth animations
- **Accessibility**: Always include focus states and respect motion preferences
- **Performance**: Avoid arbitrary values in favor of theme-based utilities
- **Custom Components**: Extract complex utility combinations into CSS components when needed

### Testing Requirements
- Unit tests for all components using Jasmine/Karma
- Test files should be co-located with components (`*.spec.ts`)
- Run `npm test` before committing changes
- Ensure all tests pass in CI/CD pipeline

## Deployment & CI/CD

### Current Deployment Issue Pattern
**Common Problem**: Docker containers serve old cached files even after CI/CD builds new images.

**Root Cause**: docker-compose uses `build: .` which can serve stale cached layers, while CI/CD builds to specific image tags.

**Solution Pattern**:
```bash
# Force fresh deployment
docker-compose down
docker rmi dayandev/ollolifestyle-webapp:latest -f
docker-compose up -d --build

# Verify new files deployed
docker exec ollo-webapp ls -la /usr/share/nginx/html/ | grep main
```

### Deployment Scripts
- `./deploy.sh` - Full CI/CD script (pulls code, builds, deploys)
- `./quick-deploy.sh` - Quick deployment for local changes
- Both scripts handle cache clearing and image rebuilding automatically

### Git Workflow for Production Server
- Server-specific files (`deploy.sh`, `quick-deploy.sh`, `docker-compose.yml`) should be in `.gitignore`
- Use `git stash` pattern to handle conflicts when pulling updates:
```bash
git stash push -m "Local deployment configs"
git pull origin main
git stash pop
```

### Container Architecture Details
- **webapp container**: Serves Angular app on internal port 3000 using Node.js `serve`
- **nginx-proxy container**: Handles SSL termination, static serving, and API proxying
- **Shared network**: `ollo-lifestyle-webapp_frontend` connects to separate API project
- **Health checks**: Built-in health monitoring for both containers

### Build Optimization
- Uses multi-stage Docker build (Node.js build → Node.js serve)
- PWA files generated automatically in production builds
- FontAwesome loaded via CDN (configured in `angular.json`)
- Assets split between `/assets` and `/public` directories

## Advanced PWA Features

### Offline Synchronization Architecture
The app implements comprehensive offline support through several key components:

**OfflineService** (`src/app/core/services/offline.service.ts`):
- Network status monitoring using `navigator.onLine` and window events
- Automatic update detection and application via Service Worker
- PWA installation prompt management
- Integration with DatabaseService for persistent offline storage

**OfflineInterceptor** (`src/app/core/interceptors/offline.interceptor.ts`):
- Intercepts all HTTP requests
- Caches successful GET responses automatically
- Queues POST/PUT/DELETE requests when offline via DatabaseService
- Attempts cached responses when requests fail
- Generates cache keys based on HTTP method, URL, and parameters

**DatabaseService** (`src/app/core/services/database.service.ts`):
- Dexie-powered IndexedDB management with 4 main tables
- Offline request queuing with automatic retry logic (max 3 attempts)
- Cached data storage with configurable TTL (default 24 hours)
- User data and push subscription management
- Automatic cleanup of expired data and synced requests
- Storage statistics and monitoring capabilities

**Cache Strategy**:
- GET requests: Cache successful responses, serve from cache when offline
- Modify requests: Queue for sync when back online with retry mechanisms
- Cache TTL: 24 hours for cached data, automatic expiry cleanup
- Automatic sync when network connection restored with failure handling

### Service Worker Integration
- Registers when app is stable (30 second delay)
- Automatic update checks every 30 seconds
- Version ready notifications via `updateAvailable$` observable
- Unrecoverable state handling with user notifications
- PWA installation prompting with deferred prompt management

### Network Status Component
- Real-time online/offline status display
- Integration with `OfflineService.isOnline$` observable
- Visual indicators for users about connectivity state

## Architecture Decisions

### Standalone Components Pattern
All components use `standalone: true` with explicit imports rather than NgModules:
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  // ...
})
```

### Signal-Based Reactivity
Application uses Angular's modern signal-based reactivity system for state management.

### HTTP Client Configuration
- Configured in `app.config.ts` with offline interceptor
- Global error handling via `provideBrowserGlobalErrorListeners()`
- Zone change detection with event coalescing for performance

### Development vs Production Configurations
- Service Worker disabled in development mode (`isDevMode()` check)
- Different build configurations for development vs production
- Environment-specific API base URLs via environment variables