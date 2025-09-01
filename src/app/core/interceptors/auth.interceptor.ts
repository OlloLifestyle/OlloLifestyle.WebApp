import { HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  
  // Skip auth for login/refresh endpoints
  if (isAuthEndpoint(req)) {
    return next(req);
  }

  // Get the auth token
  const authToken = authService.getToken();
  
  // Add Authorization header if token exists and request needs auth
  const authReq = authToken && shouldAddAuthHeader(req) 
    ? req.clone({
        setHeaders: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Handle 401 Unauthorized
        notificationService.error(
          'Session Expired',
          'Your session has expired. Please log in again.',
          { persistent: true }
        );

        // Logout and redirect to the login page
        authService.logout().pipe(
          tap(() => router.navigate(['/login']))
        ).subscribe();
      }
      return throwError(() => error);
    })
  );
};

/**
 * Check if request is to authentication endpoints
 */
function isAuthEndpoint(req: HttpRequest<any>): boolean {
  return req.url.includes('/auth/login') || 
         req.url.includes('/auth/refresh') ||
         req.url.includes('/auth/logout');
}

/**
 * Check if request should include authorization header
 */
function shouldAddAuthHeader(req: HttpRequest<any>): boolean {
  // Add auth header to API requests (exclude public endpoints)
  return (req.url.includes('/api/') || 
          req.url.startsWith('/api') ||
          req.url.includes('ollolife.com')) &&
         !req.url.includes('/public/');
}