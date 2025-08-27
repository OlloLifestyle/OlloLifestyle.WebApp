import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { OfflineService } from '../services/offline.service';
import { DatabaseService } from '../services/database.service';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  const offlineService = inject(OfflineService);
  const dbService = inject(DatabaseService);
  
  // Check if we're online
  let isOnline = true;
  offlineService.isOnline$.subscribe(online => isOnline = online);

  // If offline, try to serve from cache or queue the request
  if (!isOnline) {
    return handleOfflineRequest(req, offlineService, dbService);
  }

  // If online, proceed with the request but cache successful responses
  return next(req).pipe(
    tap(async event => {
      if (event instanceof HttpResponse && event.status === 200) {
        // Cache successful GET responses in IndexedDB
        if (req.method === 'GET') {
          const cacheKey = generateCacheKey(req);
          await dbService.setCachedData(cacheKey, event.body, 1440); // 24 hours TTL
        }
      }
    }),
    catchError(async (error: HttpErrorResponse) => {
      // If request fails due to network issues, try to serve from cache
      if (error.status === 0 || error.status >= 500) {
        const cachedResponse = await tryServeCachedResponse(req, dbService);
        if (cachedResponse) {
          return cachedResponse;
        }
      }
      return throwError(() => error);
    })
  );
};

function handleOfflineRequest(req: HttpRequest<any>, offlineService: OfflineService, dbService: DatabaseService): Observable<any> {
  // For GET requests, try to serve from cache
  if (req.method === 'GET') {
    return new Observable(subscriber => {
      tryServeCachedResponse(req, dbService).then(cachedResponse => {
        if (cachedResponse) {
          subscriber.next(cachedResponse);
          subscriber.complete();
        } else {
          // No cached data available
          subscriber.error(new HttpErrorResponse({
            error: 'No cached data available for this request',
            status: 0,
            statusText: 'Offline'
          }));
        }
      });
    });
  }

  // For POST/PUT/DELETE requests, queue them for later sync using IndexedDB
  return new Observable(subscriber => {
    const headers: Record<string, string> = {};
    req.headers.keys().forEach(key => {
      headers[key] = req.headers.get(key) || '';
    });

    dbService.queueOfflineRequest({
      url: req.url,
      method: req.method as 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      body: req.body,
      headers
    }).then(() => {
      // Return a success response to indicate the request was queued
      subscriber.next(new HttpResponse({
        status: 202,
        statusText: 'Queued for sync',
        body: { message: 'Request queued for synchronization when online', queued: true }
      }));
      subscriber.complete();
    }).catch(error => {
      subscriber.error(error);
    });
  });
}

async function tryServeCachedResponse(req: HttpRequest<any>, dbService: DatabaseService): Promise<HttpResponse<any> | null> {
  const cacheKey = generateCacheKey(req);
  const cachedData = await dbService.getCachedData(cacheKey);
  
  if (cachedData) {
    return new HttpResponse({
      status: 200,
      statusText: 'OK (Cached)',
      body: cachedData,
      headers: req.headers.set('X-Served-From-Cache', 'true')
    });
  }
  
  return null;
}

function generateCacheKey(req: HttpRequest<any>): string {
  const url = req.url.replace(req.urlWithParams, '').replace(/\/$/, '');
  const params = req.params.toString();
  return `${req.method}_${url}${params ? '_' + params : ''}`;
}