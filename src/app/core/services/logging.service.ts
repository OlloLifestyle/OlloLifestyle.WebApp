import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';

export interface LogEntry {
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  category: string;
  message: string;
  data?: any;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private readonly config = inject(ConfigService);
  private logs: LogEntry[] = [];
  private readonly maxLogEntries = 1000;

  logError(category: string, error: any, additionalData?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'error',
      category,
      message: this.extractErrorMessage(error),
      data: { error, ...additionalData },
      stackTrace: error?.stack || new Error().stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.addLogEntry(entry);

    // Log to console in development
    if (this.config.features.enableLogging && this.config.isDevelopment) {
      console.error(`[${category}]`, error, additionalData);
    }

    // TODO: Send to external logging service in production
    this.sendToExternalLogger(entry);
  }

  logWarning(category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'warn',
      category,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.addLogEntry(entry);

    if (this.config.features.enableLogging && this.config.isDevelopment) {
      console.warn(`[${category}] ${message}`, data);
    }
  }

  logInfo(category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'info',
      category,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.addLogEntry(entry);

    if (this.config.features.enableLogging && this.config.isDevelopment) {
      console.info(`[${category}] ${message}`, data);
    }
  }

  logDebug(category: string, message: string, data?: any): void {
    // Only log debug messages in development with debugging enabled
    if (!this.config.isDevelopment || !this.config.features.enableDebugMode) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'debug',
      category,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.addLogEntry(entry);
    console.debug(`[${category}] ${message}`, data);
  }

  getLogs(level?: LogEntry['level']): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  getRecentErrors(hours: number = 24): LogEntry[] {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return this.logs
      .filter(log => log.level === 'error' && log.timestamp >= cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private addLogEntry(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Maintain max log entries to prevent memory issues
    if (this.logs.length > this.maxLogEntries) {
      this.logs.shift(); // Remove oldest entry
    }
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error?.message) {
      return error.error.message;
    }
    
    if (error?.statusText) {
      return `HTTP ${error.status}: ${error.statusText}`;
    }
    
    return 'Unknown error occurred';
  }


  private sendToExternalLogger(entry: LogEntry): void {
    // TODO: Implement integration with external logging services
    // Examples: Sentry, DataDog, LogRocket, etc.
    
    if (!this.config.isDevelopment && entry.level === 'error') {
      // Example for future Sentry integration:
      // Sentry.captureException(entry.data.error, {
      //   tags: { category: entry.category },
      //   extra: entry.data
      // });
      
      // For now, just prepare the data structure that would be sent
      console.debug('Would send to external logger:', {
        timestamp: entry.timestamp.toISOString(),
        level: entry.level,
        category: entry.category,
        message: entry.message,
        url: entry.url,
        userAgent: entry.userAgent,
        stackTrace: entry.stackTrace
      });
    }
  }
}