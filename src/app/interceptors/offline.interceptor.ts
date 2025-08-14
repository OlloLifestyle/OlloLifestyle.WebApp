import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { OfflineService } from '../services/offline.service';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  const offlineService = inject(OfflineService);
  
  // Check if we're online
  let isOnline = true;
  offlineService.isOnline$.subscribe(online => isOnline = online);

  // If offline, try to serve from cache or queue the request
  if (!isOnline) {
    return handleOfflineRequest(req, offlineService);
  }

  // If online, proceed with the request but cache successful responses
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status === 200) {
        // Cache successful GET responses
        if (req.method === 'GET') {
          const cacheKey = generateCacheKey(req);
          offlineService.setCachedData(cacheKey, event.body);
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // If request fails due to network issues, try to serve from cache
      if (error.status === 0 || error.status >= 500) {
        const cachedResponse = tryServeCachedResponse(req, offlineService);
        if (cachedResponse) {
          return cachedResponse;
        }
      }
      return throwError(() => error);
    })
  );
};

function handleOfflineRequest(req: HttpRequest<any>, offlineService: OfflineService): Observable<any> {
  // For GET requests, try to serve from cache
  if (req.method === 'GET') {
    const cachedResponse = tryServeCachedResponse(req, offlineService);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // No cached data available
    return throwError(() => new HttpErrorResponse({
      error: 'No cached data available for this request',
      status: 0,
      statusText: 'Offline'
    }));
  }

  // For POST/PUT/DELETE requests, queue them for later sync
  const endpoint = req.url;
  const method = req.method as 'POST' | 'PUT' | 'DELETE';
  const data = req.body;

  offlineService.queueOfflineData(endpoint, method, data);

  // Return a success response to indicate the request was queued
  return of(new HttpResponse({
    status: 202,
    statusText: 'Queued for sync',
    body: { message: 'Request queued for synchronization when online', queued: true }
  }));
}

function tryServeCachedResponse(req: HttpRequest<any>, offlineService: OfflineService): Observable<HttpResponse<any>> | null {
  const cacheKey = generateCacheKey(req);
  const cachedData = offlineService.getCachedData(cacheKey);
  
  if (cachedData) {
    return of(new HttpResponse({
      status: 200,
      statusText: 'OK (Cached)',
      body: cachedData,
      headers: req.headers.set('X-Served-From-Cache', 'true')
    }));
  }
  
  return null;
}

function generateCacheKey(req: HttpRequest<any>): string {
  const url = req.url.replace(req.urlWithParams, '').replace(/\/$/, '');
  const params = req.params.toString();
  return `${req.method}_${url}${params ? '_' + params : ''}`;
}