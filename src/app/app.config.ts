import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

// Handlers
import { GlobalErrorHandler } from './core/handlers/global-error-handler';

// Interceptors
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { offlineInterceptor } from './core/interceptors/offline.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Core Angular Providers
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(routes),

    // HTTP Client with Interceptors
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        offlineInterceptor,
        httpErrorInterceptor // Should be last to catch unhandled errors
      ])
    ),

    // Custom Global Error Handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },

    // Service Worker
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
