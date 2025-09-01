import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

export interface LottieAnimations {
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface AppFeatures {
  enableLogging: boolean;
  enableDebugMode: boolean;
  enableOfflineSync: boolean;
  enablePushNotifications: boolean;
}

export interface AppInfo {
  name: string;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly config = environment;

  /**
   * Get API configuration
   */
  get api(): ApiConfig {
    return this.config.api;
  }

  /**
   * Get API base URL
   */
  get apiBaseUrl(): string {
    return this.config.api.baseUrl;
  }

  /**
   * Get API timeout in milliseconds
   */
  get apiTimeout(): number {
    return this.config.api.timeout;
  }

  /**
   * Get Lottie animation URLs
   */
  get lottieAnimations(): LottieAnimations {
    return this.config.assets.lottieAnimations;
  }

  /**
   * Get app features configuration
   */
  get features(): AppFeatures {
    return this.config.features;
  }

  /**
   * Get app information
   */
  get app(): AppInfo {
    return this.config.app;
  }

  /**
   * Check if in production mode
   */
  get isProduction(): boolean {
    return this.config.production;
  }

  /**
   * Check if in development mode
   */
  get isDevelopment(): boolean {
    return !this.config.production;
  }

  /**
   * Build full API URL
   */
  buildApiUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Remove trailing slash from base URL if present
    const cleanBaseUrl = this.apiBaseUrl.endsWith('/') 
      ? this.apiBaseUrl.slice(0, -1) 
      : this.apiBaseUrl;
    
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  /**
   * Get environment-specific value with fallback
   */
  getFeature<T>(featureName: keyof AppFeatures, fallback?: T): boolean | T {
    const feature = this.features[featureName];
    return feature !== undefined ? feature : (fallback ?? false);
  }

  /**
   * Runtime configuration updates (for advanced scenarios)
   */
  updateApiBaseUrl(newBaseUrl: string): void {
    // Note: This would typically be used for dynamic configuration
    // In most cases, environment files should be sufficient
    (this.config.api as any).baseUrl = newBaseUrl;
    console.warn('ConfigService: API base URL updated at runtime to:', newBaseUrl);
  }

  /**
   * Get configuration for external services
   */
  getExternalServiceConfig(serviceName: string): any {
    // This can be extended for external service configurations
    // like Sentry, Analytics, etc.
    switch (serviceName.toLowerCase()) {
      case 'sentry':
        return {
          enabled: this.isProduction,
          dsn: null // TODO: Configure via environment files
        };
      case 'analytics':
        return {
          enabled: this.isProduction,
          trackingId: null // TODO: Configure via environment files
        };
      default:
        return null;
    }
  }
}