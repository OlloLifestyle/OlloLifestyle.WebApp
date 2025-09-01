import { ErrorHandler, Injectable, inject, isDevMode } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggingService } from '../services/logging.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  // Use `inject` to get dependencies because this is a provider, not a typical service.
  private loggingService = inject(LoggingService);
  private notificationService = inject(NotificationService);

  handleError(error: any): void {
    // Ignore specific, known errors that are handled locally by components.
    // This prevents the global handler from overriding specific UI feedback.
    if (error instanceof Error && error.message === 'Invalid credentials') {
      // The login component handles this error to show a specific message.
      // We can log it here for debugging but we should not show a generic notification.
      this.loggingService.logInfo('Login error handled locally by component.', { error });
      return;
    }

    // The HttpErrorInterceptor is responsible for handling HttpErrorResponse.
    // We check for it here to prevent double-logging and double-notifying.
    if (error instanceof HttpErrorResponse) {
      // It's already been handled by the interceptor, so we can probably ignore it.
      // We can log it here if we want to be absolutely sure nothing is missed.
      this.loggingService.logInfo('HttpErrorResponse caught by GlobalErrorHandler, but handled by interceptor.', {
        status: error.status,
        url: error.url
      });
      return;
    }

    // This is a client-side error (template error, DI error, etc.)
    const title = 'Application Error';
    const message = 'An unexpected error occurred. Please try refreshing the page.';

    this.loggingService.logError(error, {
      title: 'Global Client-Side Error',
      userMessage: message,
    });

    this.notificationService.error(title, message, {
      persistent: true // Client-side errors are usually serious
    });

    // It's important to re-throw the error for the default console logger to pick it up,
    // especially during development.
    if (isDevMode()) {
      console.error('Original error passed to default handler:');
      // This will ensure the original error with its stack trace is visible in the console.
      throw error;
    }
  }
}
