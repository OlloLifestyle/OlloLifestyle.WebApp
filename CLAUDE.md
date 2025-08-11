# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm install` - Install dependencies
- `npm run start` - Start development server (http://localhost:4200)
- `npm run build` - Build for production
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

## Project Architecture

### Framework & Structure
- **Angular 20** standalone components application using modern Angular features
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
- **Testing**: Jasmine, Karma with Chrome launcher
- **Build System**: Angular CLI with @angular/build
- **Icons**: FontAwesome Free 6.7.2

### TypeScript Configuration
- **Strict Mode**: All strict TypeScript options enabled
- **Target**: ES2022 with modern JavaScript features
- **Module System**: ESM with tree-shaking support
- **Angular Compiler**: Strict templates and injection parameters

## Deployment

### Production Deployment
- **Docker Hub**: Automated builds push to Docker registry
- **Production URL**: http://192.168.50.98:3000
- **API Backend**: http://192.168.50.98:8080/api
- **Server Setup**: Uses Docker Compose with Nginx reverse proxy
- **Environment Variables**: Configure API_BASE_URL, NODE_ENV, WEBAPP_PORT in `.env`

### Monitoring & Maintenance
- **Health Checks**: Built-in health check endpoints
- **Logging**: Nginx access/error logs in `/opt/ollo-webapp/logs/`
- **Backup**: Automated backup scripts for rollback capability
- **Deployment Scripts**: Located in `scripts/` directory

### CI/CD
- **GitHub Actions**: Automated deployment on push to main branch
- **Docker Secrets**: DOCKER_USERNAME and DOCKER_PASSWORD required in repository secrets
- **Server Secrets**: HOST, USERNAME, SSH_PRIVATE_KEY, PORT for deployment

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
- Ensure all tests pass in CI/CD pipeline