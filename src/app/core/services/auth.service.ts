import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay, catchError, map, finalize } from 'rxjs/operators';
import { LoginCredentials, AuthResponse, User, RefreshTokenRequest, AuthenticateRequest, AccessProfile, JwtClaims, PermissionMap } from '../models/auth.models';
import { ConfigService } from './config.service';

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
    public originalError?: HttpErrorResponse
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly TOKEN_KEY = 'ollo_auth_token';
  private readonly USER_KEY = 'ollo_auth_user';
  private readonly ACCESS_KEY = 'ollo_auth_access';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private accessProfileSubject = new BehaviorSubject<AccessProfile | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$: Observable<boolean> = this.currentUserSubject.pipe(
    map(user => !!user),
    tap(isAuth => {
      /* quiet in production; add logger here if needed */
    }),
    delay(0) // Avoid ExpressionChangedAfterItHasBeenCheckedError
  );
  public readonly accessProfile$ = this.accessProfileSubject.asObservable();
  public readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor() {
    this.loadStoredUser();
  }

  /**
   * Step 1: Authenticate user with credentials to get companies list (don't login yet)
   */
  authenticate(request: AuthenticateRequest): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    const loginData = {
      username: request.username,
      password: request.password,
      companyName: "" // Empty company name for initial auth
    };

    return this.http.post<AuthResponse>(this.config.buildApiUrl('Auth/login'), loginData).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Authentication failed';
        if (error.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Invalid request';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server';
        }

        return throwError(() => this.buildAuthError(error, errorMessage));
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  /**
   * Step 2: Complete login with selected company and store auth data
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    return this.performLogin(credentials).pipe(
      tap((response: AuthResponse) => {
        this.setAuthData(response);
      }),
      catchError((error: HttpErrorResponse | AuthError) => {
        console.error('Login failed:', error);
        if (error instanceof HttpErrorResponse) {
          const message = this.resolveLoginErrorMessage(error);
          return throwError(() => this.buildAuthError(error, message));
        }
        return throwError(() => error);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  /**
   * Logout user and clear storage
   */
  logout(): Observable<void> {
    this.clearAuthData();
    return of(void 0);
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored token expiry date
   */
  getTokenExpiry(): Date | null {
    const expiryStr = localStorage.getItem('ollo_auth_expiry');
    return expiryStr ? new Date(expiryStr) : null;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    return new Date() >= expiry;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value && !this.isTokenExpired();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const profile = this.accessProfileSubject.value;
    if (!profile) {
      return false;
    }
    return roles.some(role => role.toLowerCase() === profile.roleName.toLowerCase());
  }

  /**
   * Check if user has a permission in the flat permission list
   */
  private hasPermission(permission: string): boolean {
    const profile = this.accessProfileSubject.value;
    if (!profile) {
      return false;
    }
    const needle = permission.toLowerCase();
    return profile.permissions.includes(needle);
  }

  /**
   * General permission check entry point (alias for hasPermission)
   */
  can(permission: string): boolean {
    return this.hasPermission(permission);
  }

  /**
   * Check if user has any permission in the provided list
   */
  canAny(permissions: string[]): boolean {
    return permissions.some(p => this.can(p));
  }

  /**
   * Check if user has a scoped permission (e.g., user.read)
   */
  canScoped(scope: keyof PermissionMap | string, permission: string): boolean {
    const profile = this.accessProfileSubject.value;
    if (!profile) {
      return false;
    }
    const scoped = profile.scopedPermissions[scope] || [];
    const needle = permission.toLowerCase();
    return scoped.includes(needle);
  }

  /**
   * Return normalized CRUD-style permissions for a module/scope
   */
  getScopePermissions(scope: keyof PermissionMap | string) {
    const profile = this.accessProfileSubject.value;
    const scoped = profile?.scopedPermissions[scope] || [];
    const has = (perm: string) => scoped.includes(perm);
    return {
      access: has('access'),
      read: has('read'),
      write: has('write') || has('edit') || has('update'),
      delete: has('delete') || has('remove')
    };
  }

  /**
   * Perform API login call
   */
  private performLogin(credentials: LoginCredentials): Observable<AuthResponse> {
    const loginData = {
      username: credentials.username,
      password: credentials.password,
      companyName: credentials.company
    };

    return this.http.post<AuthResponse>(this.config.buildApiUrl('Auth/login'), loginData).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = this.resolveLoginErrorMessage(error);
        return throwError(() => this.buildAuthError(error, message));
      })
    );
  }

  private resolveLoginErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Invalid credentials';
    }
    if (error.status === 400) {
      return this.extractErrorMessage(error) || 'Invalid request';
    }
    if (error.status === 0) {
      return 'Cannot connect to server';
    }
    return this.extractErrorMessage(error) || 'Login failed';
  }

  private buildAuthError(error: HttpErrorResponse, fallbackMessage: string): AuthError {
    const message = this.extractErrorMessage(error) || fallbackMessage;
    const code = this.extractErrorCode(error);
    const details = this.extractErrorDetails(error);
    return new AuthError(error.status, message, code, details, error);
  }

  private extractErrorCode(error: HttpErrorResponse): string | undefined {
    const payload = error.error;
    if (payload && typeof payload === 'object' && 'code' in payload) {
      return (payload as { code?: string }).code;
    }
    return error.statusText || undefined;
  }

  private extractErrorDetails(error: HttpErrorResponse): unknown {
    return error.error ?? null;
  }

  private extractErrorMessage(error: HttpErrorResponse): string | undefined {
    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }
    if (error.error && typeof error.error === 'object') {
      if (typeof error.error.message === 'string' && error.error.message.trim()) {
        return error.error.message;
      }
      if (typeof error.error.error === 'string' && error.error.error.trim()) {
        return error.error.error;
      }
      if (Array.isArray(error.error.errors) && typeof error.error.errors[0] === 'string') {
        return error.error.errors[0];
      }
    }
    if (error.message) {
      return error.message;
    }
    return undefined;
  }


  /**
   * Store authentication data
   */
  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem('ollo_auth_expiry', response.expiresAt);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    localStorage.setItem('ollo_auth_companies', JSON.stringify(response.companies));

    const claims = this.decodeToken<JwtClaims>(response.token);
    const normalize = (value: unknown): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value
          .filter((v): v is string => typeof v === 'string')
          .map(v => v.toLowerCase());
      }
      if (typeof value === 'string') return [value.toLowerCase()];
      return [];
    };

    const scopedPermissions: PermissionMap = {};
    Object.keys(claims || {})
      .filter(key => key.startsWith('permission_'))
      .forEach(key => {
        const scope = key.replace('permission_', '');
        scopedPermissions[scope] = normalize((claims as any)[key]);
      });

    const accessProfile: AccessProfile = {
      roleName: (claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string) || (claims as any).role || 'User',
      roleId: claims.role_id || '',
      permissions: normalize(claims.permission),
      scopedPermissions
    };

    localStorage.setItem(this.ACCESS_KEY, JSON.stringify(accessProfile));
    this.currentUserSubject.next(response.user);
    this.accessProfileSubject.next(accessProfile);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('ollo_auth_expiry');
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('ollo_auth_companies');
    localStorage.removeItem(this.ACCESS_KEY);
    this.currentUserSubject.next(null);
    this.accessProfileSubject.next(null);
  }

  /**
   * Load stored user data on app start
   */
  private loadStoredUser(): void {
    try {
      const storedUser = localStorage.getItem(this.USER_KEY);
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedAccess = localStorage.getItem(this.ACCESS_KEY);
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      }

      if (storedAccess) {
        const accessProfile: AccessProfile = JSON.parse(storedAccess);
        this.accessProfileSubject.next(accessProfile);
      }
    } catch (error) {
      console.error('Failed to load stored user:', error);
      this.clearAuthData();
    }
  }

  /**
   * Decode a JWT token payload
   */
  private decodeToken<T = unknown>(token: string): T {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
      const decoded = atob(padded);
      return JSON.parse(decoded) as T;
    } catch (error) {
      console.warn('Failed to decode token', error);
      return {} as T;
    }
  }
}
