import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay, catchError, map } from 'rxjs/operators';
import { LoginCredentials, AuthResponse, User, RefreshTokenRequest, AuthenticateRequest } from '../models/auth.models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly TOKEN_KEY = 'ollo_auth_token';
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
        return throwError(() => new Error(errorMessage));
      }),
      tap(() => this.isLoadingSubject.next(false))
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
   * Note: Role checking would require decoding the JWT token
   * For now, returning true for authenticated users
   */
  hasAnyRole(roles: string[]): boolean {
    return this.isAuthenticated();
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
        let errorMessage = 'Login failed';
        if (error.status === 401) {
          errorMessage = 'Invalid credentials';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Invalid request';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }


  /**
   * Store authentication data
   */
  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem('ollo_auth_expiry', response.expiresAt);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    localStorage.setItem('ollo_auth_companies', JSON.stringify(response.companies));
    this.currentUserSubject.next(response.user);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('ollo_auth_expiry');
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('ollo_auth_companies');
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