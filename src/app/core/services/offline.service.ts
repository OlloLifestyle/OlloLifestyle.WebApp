import { Injectable, inject, Injector } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, Observable, fromEvent, merge, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { DatabaseService } from './database.service';

export interface OfflineData {
  timestamp: number;
  data: any;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private swUpdate = inject(SwUpdate);
  private dbService = inject(DatabaseService);
  private injector = inject(Injector);
  
  // Network status tracking
  public readonly isOnline$: Observable<boolean> = merge(
    of(navigator.onLine),
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(
    startWith(navigator.onLine),
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Update available tracking
  public readonly updateAvailable$ = new BehaviorSubject<boolean>(false);
  
  // Installation prompt tracking
  public readonly installPrompt$ = new BehaviorSubject<boolean>(false);
  private deferredPrompt: any = null;

  constructor() {
    this.initializeServiceWorker();
    this.setupInstallPrompt();
    
    // Sync offline queue when coming back online
    this.isOnline$.subscribe(async online => {
      if (online) {
        await this.syncOfflineQueue();
        // Show online notification using simple notification API
        this.showSimpleNotification('🌐 You\'re back online!', 'Syncing your offline changes...');
      } else {
        // Show offline notification using simple notification API  
        this.showSimpleNotification('📶 You\'re now offline', 'Don\'t worry, your data will sync when you\'re back online');
      }
    });
  }

  private initializeServiceWorker(): void {
    if (this.swUpdate.isEnabled) {
      // Check for updates every 30 seconds
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 30000);

      // Listen for version updates
      this.swUpdate.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          this.updateAvailable$.next(true);
        }
      });

      // Listen for unrecoverable state
      this.swUpdate.unrecoverable.subscribe(event => {
        console.error('Service Worker in unrecoverable state:', event);
        this.notifyUser('App update failed. Please reload the page.');
      });
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.installPrompt$.next(true);
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.installPrompt$.next(false);
    });
  }

  public async applyUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled && this.updateAvailable$.value) {
      try {
        await this.swUpdate.activateUpdate();
        window.location.reload();
      } catch (error) {
        console.error('Failed to apply update:', error);
      }
    }
  }

  public async installApp(): Promise<void> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.installPrompt$.next(false);
      }
      this.deferredPrompt = null;
    }
  }

  public async queueOfflineData(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data: any): Promise<void> {
    await this.dbService.queueOfflineRequest({
      url: endpoint,
      method: method as 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      body: data
    });
  }

  // Legacy method - now using DatabaseService

  // Legacy method - now using DatabaseService

  private async syncOfflineQueue(): Promise<void> {
    const pendingRequests = await this.dbService.getPendingRequests();
    if (pendingRequests.length === 0) return;

    console.log(`Syncing ${pendingRequests.length} offline items...`);
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers || {},
          body: request.body ? JSON.stringify(request.body) : undefined
        });
        
        if (response.ok) {
          await this.dbService.markRequestSynced(request.id!);
          console.log(`Synced offline item: ${request.url}`);
        } else {
          await this.dbService.markRequestFailed(request.id!);
        }
      } catch (error) {
        console.error(`Failed to sync offline item: ${request.url}`, error);
        await this.dbService.markRequestFailed(request.id!);
      }
    }
    
    await this.dbService.clearSyncedRequests();
  }

  private async syncOfflineItem(item: OfflineData): Promise<void> {
    const url = item.endpoint.startsWith('/') ? item.endpoint : `/${item.endpoint}`;
    
    const options: RequestInit = {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (item.method !== 'GET' && item.data) {
      options.body = JSON.stringify(item.data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  public async getCachedData<T>(key: string): Promise<T | null> {
    return await this.dbService.getCachedData<T>(key);
  }

  public async setCachedData<T>(key: string, data: T): Promise<void> {
    await this.dbService.setCachedData(key, data);
  }

  private notifyUser(message: string): void {
    // Simple notification - you can enhance this with a proper notification service
    console.log('PWA Notification:', message);
    // You could also dispatch a custom event or use a toast service here
  }

  public async getOfflineQueueSize(): Promise<number> {
    const stats = await this.dbService.getStorageStats();
    return stats.offlineRequests;
  }

  public async clearOfflineQueue(): Promise<void> {
    await this.dbService.clearSyncedRequests();
  }

  // Simple notification method to avoid circular dependencies
  private async showSimpleNotification(title: string, body: string): Promise<void> {
    try {
      // Check if notifications are supported and permission is granted
      if ('Notification' in window && Notification.permission === 'granted') {
        // Use service worker to show notification if available
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            body,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/badge-72x72.png',
            tag: 'network-status',
            requireInteraction: false,
            silent: true
          });
        }
      } else {
        // Fallback: log to console for development
        console.log(`📱 ${title}: ${body}`);
      }
    } catch (error) {
      // Silently fail - notifications are not critical
      console.debug('Notification not shown:', error);
    }
  }
}