import { Injectable, isDevMode } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface LogContext {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  constructor() { }

  /**
   * Logs an error to the console and, in the future, to a remote logging service.
   * @param error The error object (can be Error, HttpErrorResponse, etc.)
   * @param context Additional context to help with debugging
   */
  logError(error: any, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';

    // In a real enterprise app, you would send this data to a logging service like Sentry,
    // Datadog, LogRocket, or a custom backend endpoint.
    //
    // Example for Sentry:
    // Sentry.withScope(scope => {
    //   scope.setExtras(this.buildContext(context));
    //   Sentry.captureException(error);
    // });

    // For now, we will log enriched information to the console.
    if (isDevMode()) {
      console.error('[Error Logged]', {
        timestamp,
        message,
        error, // The full error object
        context: this.buildContext(context),
        stack: error instanceof Error ? error.stack : null
      });
    } else {
      // In production, you might log less to the console for security/performance reasons,
      // relying on your remote logging service instead.
      console.error(`[PROD_ERROR] ${timestamp}: ${message}`);
    }
  }

  /**
   * Logs a general message. Useful for debugging application flow.
   * @param message The message to log.
   * @param context Additional context.
   */
  logInfo(message: string, context?: LogContext): void {
    if (isDevMode()) {
      console.log('[Info Logged]', {
        timestamp: new Date().toISOString(),
        message,
        context: this.buildContext(context)
      });
    }
  }

  private buildContext(context?: LogContext): object {
    // Here you could add universal context, like user ID, application version, etc.
    return {
      ...context,
      // userId: inject(AuthService).getUserId(), // Example
      // appVersion: '1.0.0' // Example
    };
  }
}
