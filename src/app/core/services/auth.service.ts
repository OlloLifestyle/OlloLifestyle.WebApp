import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { LoginCredentials, AuthResponse, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
  public readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor() {
    this.loadStoredUser();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    try {
      // Simulate API call
      const response = await this.performLogin(credentials);
      
      // Store user and auth state
      this.currentUserSubject.next(response.user);
      this.isAuthenticatedSubject.next(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('ollo_auth_user', JSON.stringify(response.user));
      localStorage.setItem('ollo_auth_token', response.token);
      
      return response;
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    localStorage.removeItem('ollo_auth_user');
    localStorage.removeItem('ollo_auth_token');
  }

  private async performLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure based on dummy credentials
        if (credentials.company === 'demo' && 
            credentials.user === 'admin' && 
            credentials.password === 'password') {
          
          const user: User = {
            id: '1',
            username: credentials.user,
            company: credentials.company,
            email: `${credentials.user}@${credentials.company}.com`,
            roles: ['admin']
          };

          const response: AuthResponse = {
            user,
            token: 'dummy-jwt-token',
            refreshToken: 'dummy-refresh-token',
            expiresIn: 3600
          };

          resolve(response);
        } else {
          // For demo purposes, always resolve after delay
          // In production, you might reject: reject(new Error('Invalid credentials'));
          const user: User = {
            id: '1',
            username: credentials.user,
            company: credentials.company,
            email: `${credentials.user}@${credentials.company}.com`,
            roles: ['user']
          };

          const response: AuthResponse = {
            user,
            token: 'dummy-jwt-token',
            refreshToken: 'dummy-refresh-token',
            expiresIn: 3600
          };

          resolve(response);
        }
      }, 2000);
    });
  }

  private loadStoredUser(): void {
    try {
      const storedUser = localStorage.getItem('ollo_auth_user');
      const storedToken = localStorage.getItem('ollo_auth_token');
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error('Failed to load stored user:', error);
      this.logout();
    }
  }

  getToken(): string | null {
    return localStorage.getItem('ollo_auth_token');
  }

  isTokenValid(): boolean {
    // In a real app, you would check token expiration
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return roles.some(role => user?.roles?.includes(role)) || false;
  }
}