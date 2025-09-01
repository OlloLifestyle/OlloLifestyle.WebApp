import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { BehaviorSubject, Observable } from 'rxjs';

// Database interfaces
export interface OfflineRequest {
  id?: number;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount?: number;
  status: 'pending' | 'failed' | 'synced';
}

export interface CachedData {
  id?: number;
  key: string;
  data: any;
  timestamp: number;
  expiry?: number; // TTL in milliseconds
  version?: number;
}

export interface UserData {
  id?: number;
  userId: string;
  profile: any;
  preferences: any;
  lastSync: number;
}

export interface PushSubscription {
  id?: number;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  timestamp: number;
  active: boolean;
}

// Database class
class OlloLifestyleDB extends Dexie {
  // Tables
  offlineRequests!: Table<OfflineRequest, number>;
  cachedData!: Table<CachedData, number>;
  userData!: Table<UserData, number>;
  pushSubscriptions!: Table<PushSubscription, number>;

  constructor() {
    super('OlloLifestyleDB');
    
    this.version(1).stores({
      offlineRequests: '++id, url, method, timestamp, status',
      cachedData: '++id, key, timestamp, expiry, version',
      userData: '++id, userId, lastSync',
      pushSubscriptions: '++id, endpoint, userId, timestamp, active'
    });

    // Hooks for automatic cleanup
    this.cachedData.hook('creating', (primKey, obj, trans) => {
      // Set default expiry to 24 hours
      if (!obj.expiry) {
        obj.expiry = Date.now() + (24 * 60 * 60 * 1000);
      }
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: OlloLifestyleDB;
  private syncStatus$ = new BehaviorSubject<'idle' | 'syncing' | 'error'>('idle');
  
  constructor() {
    this.db = new OlloLifestyleDB();
    this.initializeDatabase();
    this.scheduleCleanup();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.db.open();
      console.log('Database initialized successfully');
      await this.cleanupExpiredData();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  // Offline Request Management
  async queueOfflineRequest(request: Omit<OfflineRequest, 'id' | 'timestamp' | 'status'>): Promise<number> {
    return this.db.offlineRequests.add({
      ...request,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0
    });
  }

  async getPendingRequests(): Promise<OfflineRequest[]> {
    return this.db.offlineRequests
      .where('status')
      .equals('pending')
      .toArray();
  }

  async markRequestSynced(id: number): Promise<void> {
    await this.db.offlineRequests.update(id, { 
      status: 'synced',
      retryCount: 0
    });
  }

  async markRequestFailed(id: number): Promise<void> {
    const request = await this.db.offlineRequests.get(id);
    if (request) {
      const retryCount = (request.retryCount || 0) + 1;
      await this.db.offlineRequests.update(id, { 
        status: retryCount >= 3 ? 'failed' : 'pending',
        retryCount
      });
    }
  }

  async clearSyncedRequests(): Promise<void> {
    await this.db.offlineRequests.where('status').equals('synced').delete();
  }

  // Cache Management
  async setCachedData<T>(key: string, data: T, ttlMinutes: number = 1440): Promise<void> {
    const expiry = Date.now() + (ttlMinutes * 60 * 1000);
    
    await this.db.cachedData.put({
      key,
      data,
      timestamp: Date.now(),
      expiry,
      version: 1
    });
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const cached = await this.db.cachedData.where('key').equals(key).first();
    
    if (!cached) return null;
    
    // Check if expired
    if (cached.expiry && Date.now() > cached.expiry) {
      await this.db.cachedData.delete(cached.id!);
      return null;
    }
    
    return cached.data as T;
  }

  async invalidateCache(keyPattern?: string): Promise<void> {
    if (keyPattern) {
      const keys = await this.db.cachedData.where('key').startsWith(keyPattern).delete();
    } else {
      await this.db.cachedData.clear();
    }
  }

  // User Data Management
  async saveUserData(userId: string, profile: any, preferences: any): Promise<void> {
    const existing = await this.db.userData.where('userId').equals(userId).first();
    
    if (existing) {
      await this.db.userData.update(existing.id!, {
        profile,
        preferences,
        lastSync: Date.now()
      });
    } else {
      await this.db.userData.add({
        userId,
        profile,
        preferences,
        lastSync: Date.now()
      });
    }
  }

  async getUserData(userId: string): Promise<UserData | null> {
    const result = await this.db.userData.where('userId').equals(userId).first();
    return result || null;
  }

  // Push Subscription Management
  async savePushSubscription(subscription: PushSubscription): Promise<number> {
    // Deactivate old subscriptions for same endpoint
    await this.db.pushSubscriptions.where('endpoint').equals(subscription.endpoint).modify({ active: false });
    
    return this.db.pushSubscriptions.add({
      ...subscription,
      timestamp: Date.now(),
      active: true
    });
  }

  async getActivePushSubscription(): Promise<PushSubscription | null> {
    const result = await this.db.pushSubscriptions.where('active').equals(1).first();
    return result || null;
  }

  // Cleanup and Maintenance
  private async cleanupExpiredData(): Promise<void> {
    const now = Date.now();
    
    // Clean expired cache
    await this.db.cachedData.where('expiry').below(now).delete();
    
    // Clean old synced requests (older than 7 days)
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    await this.db.offlineRequests
      .where('timestamp')
      .below(sevenDaysAgo)
      .and(req => req.status === 'synced')
      .delete();
    
    console.log('Database cleanup completed');
  }

  private scheduleCleanup(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupExpiredData();
    }, 60 * 60 * 1000);
  }

  // Statistics and Monitoring
  async getStorageStats(): Promise<{
    offlineRequests: number;
    cachedData: number;
    userData: number;
    pushSubscriptions: number;
    totalSize: string;
  }> {
    const [offlineRequests, cachedData, userData, pushSubscriptions] = await Promise.all([
      this.db.offlineRequests.count(),
      this.db.cachedData.count(),
      this.db.userData.count(),
      this.db.pushSubscriptions.count()
    ]);

    // Estimate storage usage
    let totalSize = 'Unknown';
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          totalSize = this.formatBytes(estimate.usage);
        }
      } catch (error) {
        console.warn('Could not estimate storage usage:', error);
      }
    }

    return {
      offlineRequests,
      cachedData,
      userData,
      pushSubscriptions,
      totalSize
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Sync Status Observable
  get syncStatus(): Observable<'idle' | 'syncing' | 'error'> {
    return this.syncStatus$.asObservable();
  }

  setSyncStatus(status: 'idle' | 'syncing' | 'error'): void {
    this.syncStatus$.next(status);
  }

  // Export/Import for debugging
  async exportData(): Promise<any> {
    return {
      offlineRequests: await this.db.offlineRequests.toArray(),
      cachedData: await this.db.cachedData.toArray(),
      userData: await this.db.userData.toArray(),
      pushSubscriptions: await this.db.pushSubscriptions.toArray(),
      timestamp: Date.now()
    };
  }

  async clearAllData(): Promise<void> {
    await this.db.transaction('rw', this.db.tables, async () => {
      await Promise.all(this.db.tables.map(table => table.clear()));
    });
    console.log('All database data cleared');
  }
}