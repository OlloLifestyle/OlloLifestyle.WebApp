import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get the auth token
  const authToken = authService.getToken();
  
  // If we have a token and the request is going to our API, add the Authorization header
  if (authToken && shouldAddAuthHeader(req)) {
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }
  
  return next(req);
};

function shouldAddAuthHeader(req: HttpRequest<any>): boolean {
  // Add auth header to requests going to our API endpoints
  // You can customize this logic based on your API structure
  return req.url.includes('/api/') || 
         req.url.startsWith('/api') ||
         req.url.includes('ollolife.com');
}