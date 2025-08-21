import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return of(true);
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;
  return of(router.createUrlTree(['/login'], { queryParams: { returnUrl } }));
};

/**
 * Guard to prevent authenticated users from accessing guest-only routes (like login)
 */
export const guestGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return of(true);
  }

  // Redirect authenticated users to dashboard
  return of(router.createUrlTree(['/dashboard']));
};

/**
 * Factory function to create role-based guards
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state): Observable<boolean | UrlTree> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
    }

    // Check if user has required role
    const hasRole = authService.hasAnyRole(allowedRoles);
    if (hasRole) {
      return of(true);
    }

    // User doesn't have required role
    console.warn(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
    return of(router.createUrlTree(['/unauthorized']));
  };
};

/**
 * Guard for admin-only routes
 */
export const adminGuard: CanActivateFn = roleGuard(['admin']);

/**
 * Guard for manager-level access (admin or manager roles)
 */
export const managerGuard: CanActivateFn = roleGuard(['admin', 'manager']);