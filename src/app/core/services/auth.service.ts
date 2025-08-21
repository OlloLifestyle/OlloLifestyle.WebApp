import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay, catchError, map } from 'rxjs/operators';
import { LoginCredentials, AuthResponse, User, RefreshTokenRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'ollo_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'ollo_auth_refresh_token';
  private readonly USER_KEY = 'ollo_auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$: Observable<boolean> = this.currentUserSubject.pipe(
    map(user => !!user),
    tap(isAuth => console.log('Auth state changed:', isAuth)),
    delay(0) // Avoid ExpressionChangedAfterItHasBeenCheckedError
  );
  public readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor() {
    this.loadStoredUser();
  }

  /**
   * Authenticate user with credentials
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    return this.performLogin(credentials).pipe(
      tap((response: AuthResponse) => {
        this.setAuthData(response);
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      }),
      tap(() => this.isLoadingSubject.next(false))
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
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Refresh JWT token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.performRefreshToken(request).pipe(
      tap((response: AuthResponse) => {
        this.setAuthData(response);
      }),
      catchError((error) => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes(role) || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return roles.some(role => user?.roles?.includes(role)) || false;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Simulate API login call
   */
  private performLogin(credentials: LoginCredentials): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        // Mock authentication logic
        if (credentials.username === 'admin' && 
            credentials.company === 'demo' && 
            credentials.password === 'password') {
          
          const user: User = {
            id: '1',
            username: credentials.username,
            company: credentials.company,
            email: `${credentials.username}@${credentials.company}.com`,
            roles: ['admin', 'user']
          };

          const response: AuthResponse = {
            user,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
            refreshToken: 'refresh-token-mock',
            expiresIn: 3600
          };

          observer.next(response);
          observer.complete();
        } else {
          observer.error(new Error('Invalid credentials'));
        }
      }, 1500); // Simulate network delay
    });
  }

  /**
   * Simulate API refresh token call
   */
  private performRefreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        // Mock refresh logic
        const currentUser = this.getCurrentUser();
        if (currentUser && request.refreshToken) {
          const response: AuthResponse = {
            user: currentUser,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshed.token',
            refreshToken: 'new-refresh-token-mock',
            expiresIn: 3600
          };
          observer.next(response);
          observer.complete();
        } else {
          observer.error(new Error('Invalid refresh token'));
        }
      }, 500);
    });
  }

  /**
   * Store authentication data
   */
  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Load stored user data on app start
   */
  private loadStoredUser(): void {
    try {
      const storedUser = localStorage.getItem(this.USER_KEY);
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Failed to load stored user:', error);
      this.clearAuthData();
    }
  }
}