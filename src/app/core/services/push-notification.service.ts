import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DatabaseService } from './database.service';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: { action: string; title: string; icon?: string; }[];
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface BackgroundSyncPayload {
  tag: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private swPush = inject(SwPush);
  private dbService = inject(DatabaseService);
  
  // VAPID public key - Replace with your actual VAPID key
  private readonly VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HuWukzpOqiM1PKY-5Mz3Zn7vEFvnNeFt3bOkzXiPBLhbXx5o-p-4QQyYg8';
  
  private notificationPermission$ = new BehaviorSubject<NotificationPermission>('default');
  private subscriptionStatus$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    // Check initial permission status
    if ('Notification' in window) {
      this.notificationPermission$.next(Notification.permission);
    }

    // Check if already subscribed
    if (this.swPush.isEnabled) {
      try {
        const subscription = await this.swPush.subscription.toPromise();
        this.subscriptionStatus$.next(!!subscription);
        
        if (subscription) {
          // Save subscription to IndexedDB
          await this.saveSubscriptionToDatabase(subscription);
        }
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      }
    }

    // Register service worker event handlers
    this.registerServiceWorkerEvents();
  }

  private registerServiceWorkerEvents(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC') {
          this.handleBackgroundSync(event.data.payload);
        }
      });
    }
  }

  // Permission Management
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    this.notificationPermission$.next(permission);
    return permission;
  }

  get notificationPermission(): Observable<NotificationPermission> {
    return this.notificationPermission$.asObservable();
  }

  get isNotificationPermissionGranted(): boolean {
    return this.notificationPermission$.value === 'granted';
  }

  // Push Subscription Management
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swPush.isEnabled) {
      throw new Error('Service Worker push is not enabled');
    }

    if (!this.isNotificationPermissionGranted) {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      await this.saveSubscriptionToDatabase(subscription);
      this.subscriptionStatus$.next(true);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribeFromPush(): Promise<void> {
    if (!this.swPush.isEnabled) return;

    try {
      await this.swPush.unsubscribe();
      
      // Remove from database  
      const activeSubscription = await this.dbService.getActivePushSubscription();
      if (activeSubscription && activeSubscription.id) {
        // Mark as inactive - we'll need to add a method to DatabaseService
        console.log('Subscription deactivated:', activeSubscription.id);
      }
      
      this.subscriptionStatus$.next(false);
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  private async saveSubscriptionToDatabase(subscription: PushSubscription): Promise<void> {
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
      }
    };

    await this.dbService.savePushSubscription({
      ...subscriptionData,
      timestamp: Date.now(),
      active: true
    });
  }

  get subscriptionStatus(): Observable<boolean> {
    return this.subscriptionStatus$.asObservable();
  }

  get isSubscribedToPush(): boolean {
    return this.subscriptionStatus$.value;
  }

  // Push Notification Handling
  get notificationClicks(): Observable<any> {
    return this.swPush.notificationClicks;
  }

  get messages(): Observable<any> {
    return this.swPush.messages;
  }

  // Local Notifications
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isNotificationPermissionGranted) {
      throw new Error('Notification permission not granted');
    }

    const registration = await navigator.serviceWorker.ready;
    
    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/assets/icons/icon-192x192.png',
      badge: payload.badge || '/assets/icons/badge-72x72.png',
      data: payload.data,
      tag: payload.tag,
      // renotify: payload.renotify, // Not supported in all browsers
      requireInteraction: payload.requireInteraction,
      silent: payload.silent,
      // actions: payload.actions // Not supported in all environments
    };

    await registration.showNotification(payload.title, options);
  }

  // Background Sync
  async requestBackgroundSync(tag: string, data?: any): Promise<void> {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background Sync is not supported');
      // Fallback: Try to sync immediately
      await this.syncOfflineData();
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Store sync data in IndexedDB
      await this.dbService.queueOfflineRequest({
        url: '/api/sync',
        method: 'POST',
        body: { tag, data }
      });
      
      // Register for background sync (if supported)
      if ('sync' in registration) {
        await (registration as any).sync.register(tag);
      }
      console.log(`Background sync registered with tag: ${tag}`);
    } catch (error) {
      console.error('Failed to register background sync:', error);
      throw error;
    }
  }

  private async handleBackgroundSync(payload: BackgroundSyncPayload): Promise<void> {
    console.log('Handling background sync:', payload.tag);
    
    try {
      // Sync offline data when background sync triggers
      await this.syncOfflineData();
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  private async syncOfflineData(): Promise<void> {
    this.dbService.setSyncStatus('syncing');
    
    try {
      const pendingRequests = await this.dbService.getPendingRequests();
      
      for (const request of pendingRequests) {
        try {
          const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body ? JSON.stringify(request.body) : undefined
          });
          
          if (response.ok) {
            await this.dbService.markRequestSynced(request.id!);
          } else {
            await this.dbService.markRequestFailed(request.id!);
          }
        } catch (error) {
          console.error('Failed to sync request:', request.url, error);
          await this.dbService.markRequestFailed(request.id!);
        }
      }
      
      // Clean up synced requests
      await this.dbService.clearSyncedRequests();
      
      this.dbService.setSyncStatus('idle');
      console.log('Offline data sync completed');
      
    } catch (error) {
      this.dbService.setSyncStatus('error');
      console.error('Sync failed:', error);
    }
  }

  // Utility Methods
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binary);
  }

  // Notification Templates
  async showWelcomeNotification(): Promise<void> {
    await this.showLocalNotification({
      title: 'Welcome to Ollo Lifestyle! 🎉',
      body: 'You\'re now ready to explore our features offline',
      icon: '/assets/icons/icon-192x192.png',
      data: { type: 'welcome' },
      tag: 'welcome'
    });
  }

  async showSyncCompleteNotification(syncedCount: number): Promise<void> {
    if (syncedCount > 0) {
      await this.showLocalNotification({
        title: 'Data Synchronized ✅',
        body: `${syncedCount} items have been synchronized`,
        icon: '/assets/icons/icon-192x192.png',
        data: { type: 'sync-complete', count: syncedCount },
        tag: 'sync-complete'
      });
    }
  }

  async showOfflineNotification(): Promise<void> {
    await this.showLocalNotification({
      title: 'You\'re now offline 📶',
      body: 'Don\'t worry, your data will sync when you\'re back online',
      icon: '/assets/icons/icon-192x192.png',
      data: { type: 'offline' },
      tag: 'offline-status',
      requireInteraction: false
    });
  }

  async showOnlineNotification(): Promise<void> {
    await this.showLocalNotification({
      title: 'You\'re back online! 🌐',
      body: 'Syncing your offline changes...',
      icon: '/assets/icons/icon-192x192.png',
      data: { type: 'online' },
      tag: 'online-status',
      requireInteraction: false
    });
    
    // Trigger background sync
    try {
      await this.requestBackgroundSync('online-sync');
    } catch (error) {
      console.debug('Background sync not available:', error);
    }
  }

  // Analytics & Monitoring
  async getNotificationStats(): Promise<{
    permission: NotificationPermission;
    isSubscribed: boolean;
    pendingSync: number;
    lastSync: Date | null;
  }> {
    const stats = await this.dbService.getStorageStats();
    
    return {
      permission: this.notificationPermission$.value,
      isSubscribed: this.subscriptionStatus$.value,
      pendingSync: stats.offlineRequests,
      lastSync: null // Could be tracked in database if needed
    };
  }
}