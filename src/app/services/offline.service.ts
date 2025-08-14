import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, Observable, fromEvent, merge, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, shareReplay } from 'rxjs/operators';

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
  private offlineQueue: OfflineData[] = [];
  private readonly OFFLINE_STORAGE_KEY = 'ollo_offline_queue';
  
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
    this.loadOfflineQueue();
    this.setupInstallPrompt();
    
    // Sync offline queue when coming back online
    this.isOnline$.subscribe(online => {
      if (online) {
        this.syncOfflineQueue();
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

  public queueOfflineData(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data: any): void {
    const offlineData: OfflineData = {
      timestamp: Date.now(),
      endpoint,
      method,
      data
    };

    this.offlineQueue.push(offlineData);
    this.saveOfflineQueue();
  }

  private loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem(this.OFFLINE_STORAGE_KEY);
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  private saveOfflineQueue(): void {
    try {
      localStorage.setItem(this.OFFLINE_STORAGE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private async syncOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    console.log(`Syncing ${this.offlineQueue.length} offline items...`);
    
    const itemsToSync = [...this.offlineQueue];
    this.offlineQueue = [];
    this.saveOfflineQueue();

    for (const item of itemsToSync) {
      try {
        await this.syncOfflineItem(item);
        console.log(`Synced offline item: ${item.endpoint}`);
      } catch (error) {
        console.error(`Failed to sync offline item: ${item.endpoint}`, error);
        // Re-queue failed items
        this.offlineQueue.push(item);
      }
    }

    if (this.offlineQueue.length > 0) {
      this.saveOfflineQueue();
    }
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

  public getCachedData<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`ollo_cache_${key}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if data is not too old (24 hours max)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }

  public setCachedData<T>(key: string, data: T): void {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`ollo_cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  private notifyUser(message: string): void {
    // Simple notification - you can enhance this with a proper notification service
    console.log('PWA Notification:', message);
    // You could also dispatch a custom event or use a toast service here
  }

  public getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  public clearOfflineQueue(): void {
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }
}