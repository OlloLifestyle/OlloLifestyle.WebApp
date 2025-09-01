import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggingService } from '../services/logging.service';
import { NotificationService } from '../services/notification.service';
import { ConfigService } from '../services/config.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly loggingService = inject(LoggingService);
  private readonly notificationService = inject(NotificationService);
  private readonly config = inject(ConfigService);

  handleError(error: any): void {
    // Log the error details
    this.loggingService.logError('Global Error', error);

    // Extract meaningful error information
    const errorInfo = this.extractErrorInfo(error);

    // Show user-friendly notification (avoid technical details)
    this.notificationService.error(
      'Something went wrong',
      errorInfo.userMessage,
      { 
        persistent: false,
        duration: 6000 
      }
    );

    // Log to console in development
    if (this.config.isDevelopment && this.config.features.enableLogging) {
      console.error('GlobalErrorHandler:', error);
    }
  }

  private extractErrorInfo(error: any): { userMessage: string; technicalMessage: string } {
    let userMessage = 'An unexpected error occurred. Please try again.';
    let technicalMessage = error?.message || 'Unknown error';

    if (error?.rejection) {
      // Promise rejection
      technicalMessage = error.rejection?.message || error.rejection;
      userMessage = 'A background operation failed. Please refresh the page.';
    } else if (error?.error?.message) {
      // HTTP error with nested error
      technicalMessage = error.error.message;
    } else if (error?.message?.includes('ChunkLoadError')) {
      // Chunk loading error (common in SPAs)
      userMessage = 'Failed to load application resources. Please refresh the page.';
      technicalMessage = 'Chunk loading failed - likely due to deployment update';
    } else if (error?.message?.includes('Loading chunk')) {
      userMessage = 'Failed to load page resources. Please refresh the page.';
      technicalMessage = error.message;
    } else if (error?.name === 'TypeError') {
      userMessage = 'A technical error occurred. Please try again or contact support.';
    }

    return { userMessage, technicalMessage };
  }

}