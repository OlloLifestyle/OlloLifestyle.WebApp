import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { OfflineService } from '../../core/services/offline.service';

@Component({
  selector: 'app-offline-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offline-status-container">
      <!-- Offline Status Banner -->
      <div 
        class="offline-banner"
        [class.offline]="!(isOnline$ | async)"
        [class.online]="isOnline$ | async">
        <div class="status-content">
          <i class="fas" [class.fa-wifi]="isOnline$ | async" [class.fa-wifi-slash]="!(isOnline$ | async)"></i>
          <span class="status-text">
            {{ (isOnline$ | async) ? 'Online' : 'Offline' }}
          </span>
          <div class="queue-info" *ngIf="!(isOnline$ | async) && getQueueSize() > 0">
            {{ getQueueSize() }} items queued for sync
          </div>
        </div>
      </div>

      <!-- Update Available Banner -->
      <div 
        class="update-banner"
        *ngIf="updateAvailable$ | async">
        <div class="update-content">
          <i class="fas fa-download"></i>
          <span class="update-text">Update available</span>
          <button class="update-btn" (click)="applyUpdate()">
            <i class="fas fa-sync-alt"></i>
            Update Now
          </button>
        </div>
      </div>

      <!-- Install App Banner -->
      <div 
        class="install-banner"
        *ngIf="installPrompt$ | async">
        <div class="install-content">
          <i class="fas fa-mobile-alt"></i>
          <span class="install-text">Install Ollo Lifestyle app</span>
          <button class="install-btn" (click)="installApp()">
            <i class="fas fa-plus"></i>
            Install
          </button>
        </div>
      </div>

      <!-- Sync Status -->
      <div 
        class="sync-status"
        *ngIf="(isOnline$ | async) && getQueueSize() > 0">
        <div class="sync-content">
          <i class="fas fa-sync-alt fa-spin"></i>
          <span class="sync-text">Syncing offline data...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .offline-status-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
    }

    .offline-banner, .update-banner, .install-banner, .sync-status {
      padding: 8px 16px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      transform: translateY(-100%);
    }

    .offline-banner.offline {
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      color: white;
      transform: translateY(0);
    }

    .offline-banner.online {
      background: linear-gradient(135deg, #51cf66, #40c057);
      color: white;
      transform: translateY(0);
      animation: slideUp 3s ease forwards;
    }

    .update-banner {
      background: linear-gradient(135deg, #4c6ef5, #364fc7);
      color: white;
      transform: translateY(0);
    }

    .install-banner {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: white;
      transform: translateY(0);
    }

    .sync-status {
      background: linear-gradient(135deg, #ffd43b, #fab005);
      color: #212529;
      transform: translateY(0);
    }

    .status-content, .update-content, .install-content, .sync-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .queue-info {
      font-size: 12px;
      opacity: 0.9;
      margin-left: 8px;
    }

    .update-btn, .install-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .update-btn:hover, .install-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    @keyframes slideUp {
      0% { transform: translateY(0); }
      80% { transform: translateY(0); }
      100% { transform: translateY(-100%); }
    }

    .fa-spin {
      animation: fa-spin 1s infinite linear;
    }

    @keyframes fa-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(359deg); }
    }

    @media (max-width: 768px) {
      .status-content, .update-content, .install-content, .sync-content {
        font-size: 12px;
        padding: 4px;
      }
      
      .queue-info {
        display: none;
      }
    }
  `]
})
export class OfflineStatusComponent {
  private offlineService = inject(OfflineService);

  public readonly isOnline$: Observable<boolean> = this.offlineService.isOnline$;
  public readonly updateAvailable$: Observable<boolean> = this.offlineService.updateAvailable$;
  public readonly installPrompt$: Observable<boolean> = this.offlineService.installPrompt$;

  public applyUpdate(): void {
    this.offlineService.applyUpdate();
  }

  public installApp(): void {
    this.offlineService.installApp();
  }

  public getQueueSize(): number {
    return this.offlineService.getOfflineQueueSize();
  }
}