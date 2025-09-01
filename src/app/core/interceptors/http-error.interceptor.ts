import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { LoggingService } from '../services/logging.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const loggingService = inject(LoggingService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Let auth interceptor handle 401s
      if (error.status === 401) {
        return throwError(() => error);
      }

      // Log all HTTP errors
      loggingService.logError('HTTP Error', error, {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText
      });

      // Handle different error types with user-friendly messages
      const errorInfo = getErrorInfo(error, req.url);
      
      if (errorInfo.showNotification) {
        notificationService.error(errorInfo.title, errorInfo.message, {
          duration: errorInfo.duration || 6000
        });
      }

      return throwError(() => error);
    })
  );
};

interface ErrorInfo {
  title: string;
  message: string;
  showNotification: boolean;
  duration?: number;
}

function getErrorInfo(error: HttpErrorResponse, url: string): ErrorInfo {
  const status = error.status;
  
  // Default error info
  let errorInfo: ErrorInfo = {
    title: 'Request Failed',
    message: 'Please try again later.',
    showNotification: true,
    duration: 6000
  };

  switch (status) {
    case 0:
      // Network error - no response from server
      errorInfo = {
        title: 'Connection Failed',
        message: 'Please check your internet connection and try again.',
        showNotification: true,
        duration: 8000
      };
      break;

    case 400:
      // Bad Request - usually validation errors
      const validationMessage = extractValidationMessage(error);
      errorInfo = {
        title: 'Invalid Request',
        message: validationMessage || 'Please check your input and try again.',
        showNotification: true
      };
      break;

    case 403:
      // Forbidden - user doesn't have permission
      errorInfo = {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        showNotification: true
      };
      break;

    case 404:
      // Not Found - resource doesn't exist
      errorInfo = {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        showNotification: isUserFacingRequest(url) // Only show for user-initiated requests
      };
      break;

    case 409:
      // Conflict - resource already exists or version mismatch
      errorInfo = {
        title: 'Conflict',
        message: 'This action conflicts with existing data. Please refresh and try again.',
        showNotification: true
      };
      break;

    case 422:
      // Unprocessable Entity - validation error
      const validationMsg = extractValidationMessage(error);
      errorInfo = {
        title: 'Validation Error',
        message: validationMsg || 'Please correct the highlighted fields.',
        showNotification: true
      };
      break;

    case 429:
      // Too Many Requests - rate limiting
      errorInfo = {
        title: 'Too Many Requests',
        message: 'Please wait a moment before trying again.',
        showNotification: true,
        duration: 8000
      };
      break;

    case 500:
      // Internal Server Error
      errorInfo = {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        showNotification: true,
        duration: 8000
      };
      break;

    case 502:
    case 503:
    case 504:
      // Bad Gateway, Service Unavailable, Gateway Timeout
      errorInfo = {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again in a few minutes.',
        showNotification: true,
        duration: 10000
      };
      break;

    default:
      // Generic error for other status codes
      if (status >= 500) {
        errorInfo.title = 'Server Error';
        errorInfo.message = 'A server error occurred. Please try again later.';
      }
      break;
  }

  return errorInfo;
}

function extractValidationMessage(error: HttpErrorResponse): string | null {
  // Try to extract meaningful validation messages from common API response formats
  if (error.error) {
    // Common formats: { message: "string" }, { error: "string" }, { errors: ["string"] }
    if (typeof error.error.message === 'string') {
      return error.error.message;
    }
    if (typeof error.error.error === 'string') {
      return error.error.error;
    }
    if (Array.isArray(error.error.errors) && error.error.errors.length > 0) {
      return error.error.errors[0];
    }
    // Handle validation errors with field-specific messages
    if (typeof error.error === 'object') {
      const firstError = Object.values(error.error)[0];
      if (typeof firstError === 'string') {
        return firstError;
      }
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
  }
  return null;
}

function isUserFacingRequest(url: string): boolean {
  // Only show 404 notifications for user-initiated requests, not background API calls
  const backgroundEndpoints = [
    '/health',
    '/status',
    '/ping',
    '/metrics',
    '/version'
  ];
  
  return !backgroundEndpoints.some(endpoint => url.includes(endpoint));
}