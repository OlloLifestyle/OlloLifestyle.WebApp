import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { LoggingService } from '../services/logging.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const notificationService = inject(NotificationService);
  const loggingService = inject(LoggingService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // The auth interceptor already handles 401s by redirecting to login.
      // We will not handle 401s here to avoid duplicate notifications.
      // The offline interceptor handles status 0.
      if (error.status === 401 || error.status === 0) {
        return throwError(() => error);
      }

      let title = 'An Error Occurred';
      let message = 'Something went wrong. Please try again later.';

      switch (error.status) {
        case 400: // Bad Request
          title = 'Invalid Request';
          message = error.error?.message || 'The server could not process your request. Please check your input.';
          break;
        case 403: // Forbidden
          title = 'Access Denied';
          message = 'You do not have permission to perform this action.';
          break;
        case 404: // Not Found
          title = 'Not Found';
          message = `The requested resource could not be found: ${error.url}`;
          break;
        case 422: // Unprocessable Entity
          title = 'Validation Error';
          // Assuming the server returns a more detailed error object
          message = error.error?.message || 'Some of the data you submitted is invalid.';
          break;
        case 500: // Internal Server Error
        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
          title = 'Server Error';
          message = 'We are experiencing technical difficulties. Please try again in a few moments.';
          break;
      }

      // Log the detailed error
      loggingService.logError(error, {
        title,
        userMessage: message,
        url: error.url,
        status: error.status,
      });

      // Show a user-friendly notification
      notificationService.error(title, message, { persistent: error.status >= 500 });

      return throwError(() => error);
    })
  );
};
