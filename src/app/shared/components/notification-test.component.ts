import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PushNotificationService } from '../../core/services/push-notification.service';
import { OfflineService } from '../../core/services/offline.service';
import { DatabaseService } from '../../core/services/database.service';

@Component({
  selector: 'app-notification-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-6 max-w-md mx-auto">
      <h3 class="text-xl font-semibold text-white mb-4">🧪 PWA Features Test</h3>
      
      <div class="space-y-3">
        <!-- Notification Permission -->
        <div class="flex items-center justify-between">
          <span class="text-white/80">Notification Permission:</span>
          <span class="px-2 py-1 rounded text-sm"
                [ngClass]="getPermissionClasses()">
            {{ notificationPermission() }}
          </span>
        </div>

        <!-- Online Status -->
        <div class="flex items-center justify-between">
          <span class="text-white/80">Online Status:</span>
          <span class="px-2 py-1 rounded text-sm"
                [ngClass]="getOnlineStatusClasses()">
            {{ isOnline ? 'Online' : 'Offline' }}
          </span>
        </div>

        <!-- Storage Info -->
        <div class="flex items-center justify-between">
          <span class="text-white/80">Storage Usage:</span>
          <span class="px-2 py-1 bg-blue/20 text-blue rounded text-sm">
            {{ storageInfo }}
          </span>
        </div>
      </div>

      <div class="mt-6 space-y-3">
        <!-- Test Buttons -->
        <button 
          (click)="requestNotificationPermission()"
          [disabled]="notificationPermission() === 'granted'"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          <i class="fas fa-bell mr-2"></i>
          Request Notifications
        </button>

        <button 
          (click)="testLocalNotification()"
          [disabled]="notificationPermission() !== 'granted'"
          class="w-full px-4 py-2 bg-green/20 text-green border border-green/30 rounded-lg 
                 transition-all duration-200 hover:bg-green/30 disabled:opacity-50 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-2 focus:ring-green/50">
          <i class="fas fa-paper-plane mr-2"></i>
          Test Notification
        </button>

        <button 
          (click)="simulateOfflineSync()"
          class="w-full px-4 py-2 bg-purple-20 text-purple border border-purple-30 rounded-lg 
                 transition-all duration-200 hover-bg-purple-30
                 focus:outline-none focus:ring-2 focus-ring-purple-50">
          <i class="fas fa-database mr-2"></i>
          Simulate Offline Sync
        </button>

        <button 
          (click)="clearStorage()"
          class="w-full px-4 py-2 bg-red/20 text-red border border-red/30 rounded-lg 
                 transition-all duration-200 hover:bg-red/30
                 focus:outline-none focus:ring-2 focus:ring-red/50">
          <i class="fas fa-trash mr-2"></i>
          Clear Storage
        </button>
      </div>

      <div class="mt-6 p-3 bg-white/5 rounded-lg">
        <h4 class="text-sm font-medium text-white mb-2">💡 Test Instructions:</h4>
        <ul class="text-xs text-white/70 space-y-1">
          <li>1. Request notification permission</li>
          <li>2. Test local notifications</li>
          <li>3. Disconnect internet to test offline mode</li>
          <li>4. Reconnect to see sync notifications</li>
          <li>5. Check browser DevTools > Application > Storage</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .purple { 
      --tw-text-opacity: 1; 
      color: rgb(168 85 247 / var(--tw-text-opacity)); 
    }
    .bg-purple-20 { 
      background-color: rgb(168 85 247 / 0.2); 
    }
    .border-purple-30 { 
      border-color: rgb(168 85 247 / 0.3); 
    }
    .hover-bg-purple-30:hover { 
      background-color: rgb(168 85 247 / 0.3); 
    }
    .focus-ring-purple-50:focus { 
      --tw-ring-color: rgb(168 85 247 / 0.5); 
    }
  `]
})
export class NotificationTestComponent {
  private pushService = inject(PushNotificationService);
  private offlineService = inject(OfflineService);
  private dbService = inject(DatabaseService);

  notificationPermission = signal<NotificationPermission>('default');
  isOnline = navigator.onLine;
  storageInfo = 'Loading...';

  constructor() {
    // Monitor notification permission
    this.pushService.notificationPermission.subscribe(permission => {
      this.notificationPermission.set(permission);
    });

    // Monitor online status
    this.offlineService.isOnline$.subscribe(online => {
      this.isOnline = online;
    });

    // Load storage info
    this.loadStorageInfo();
  }

  async requestNotificationPermission() {
    try {
      await this.pushService.requestNotificationPermission();
      console.log('✅ Notification permission granted');
    } catch (error) {
      console.error('❌ Notification permission denied:', error);
    }
  }

  async testLocalNotification() {
    try {
      await this.pushService.showLocalNotification({
        title: '🧪 Test Notification',
        body: 'This is a test notification from your PWA!',
        data: { type: 'test' },
        tag: 'test-notification'
      });
      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
    }
  }

  async simulateOfflineSync() {
    try {
      // Add some test data to the offline queue
      await this.dbService.queueOfflineRequest({
        url: '/api/test',
        method: 'POST',
        body: { 
          message: 'Test offline sync',
          timestamp: Date.now()
        }
      });

      await this.pushService.showLocalNotification({
        title: '📦 Data Queued',
        body: 'Test data has been queued for sync when online',
        data: { type: 'sync-test' },
        tag: 'sync-notification'
      });

      this.loadStorageInfo();
      console.log('✅ Offline sync simulated');
    } catch (error) {
      console.error('❌ Failed to simulate sync:', error);
    }
  }

  async clearStorage() {
    try {
      await this.dbService.clearAllData();
      this.loadStorageInfo();

      await this.pushService.showLocalNotification({
        title: '🗑️ Storage Cleared',
        body: 'All offline data has been cleared',
        data: { type: 'clear' },
        tag: 'clear-notification'
      });

      console.log('✅ Storage cleared');
    } catch (error) {
      console.error('❌ Failed to clear storage:', error);
    }
  }

  private async loadStorageInfo() {
    try {
      const stats = await this.dbService.getStorageStats();
      this.storageInfo = `${stats.totalSize}`;
    } catch (error) {
      this.storageInfo = 'Unknown';
      console.error('Failed to load storage info:', error);
    }
  }

  getPermissionClasses() {
    const permission = this.notificationPermission();
    return {
      'bg-green/20 text-green': permission === 'granted',
      'bg-red/20 text-red': permission === 'denied',
      'bg-yellow/20 text-yellow': permission === 'default'
    };
  }

  getOnlineStatusClasses() {
    return {
      'bg-green/20 text-green': this.isOnline,
      'bg-red/20 text-red': !this.isOnline
    };
  }
}