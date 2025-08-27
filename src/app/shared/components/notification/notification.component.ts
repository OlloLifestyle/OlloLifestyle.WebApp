import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { NotificationService, NotificationData } from '../../../core/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('notificationAnimation', [
      transition(':enter', [
        style({
          transform: 'translateX(100%)',
          opacity: 0,
          scale: 0.8
        }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', 
          style({
            transform: 'translateX(0)',
            opacity: 1,
            scale: 1
          })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({
            transform: 'translateX(100%)',
            opacity: 0,
            scale: 0.8
          })
        )
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger(100, [
            animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', 
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="notification-container" [@listAnimation]="notifications().length">
      <div 
        *ngFor="let notification of notifications(); trackBy: trackByFn"
        [@notificationAnimation]
        class="notification-toast"
        [class]="'notification-' + notification.type"
        (click)="dismiss(notification.id)"
      >
        <!-- Icon Container -->
        <div class="notification-icon" [class]="'icon-' + notification.type">
          <i [class]="getIconClass(notification.type)"></i>
        </div>
        
        <!-- Content -->
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div *ngIf="notification.message" class="notification-message">
            {{ notification.message }}
          </div>
        </div>
        
        <!-- Close Button -->
        <button 
          class="notification-close"
          (click)="$event.stopPropagation(); dismiss(notification.id)"
          aria-label="Close notification"
        >
          <i class="fas fa-times"></i>
        </button>
        
        <!-- Progress Bar (if not persistent) -->
        <div 
          *ngIf="!notification.persistent" 
          class="notification-progress"
          [style.animation-duration]="notification.duration + 'ms'"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 24px;
      z-index: 10000;
      max-width: 400px;
      pointer-events: none;
    }

    .notification-toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      margin-bottom: 12px;
      border-radius: 16px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 20px 40px -12px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      cursor: pointer;
      pointer-events: auto;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 400px;
      min-width: 320px;
    }

    .notification-toast:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 32px 64px -12px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    /* Success Notification */
    .notification-success {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.3);
    }

    .notification-success:hover {
      box-shadow: 
        0 32px 64px -12px rgba(34, 197, 94, 0.3),
        0 0 0 1px rgba(34, 197, 94, 0.4);
    }

    /* Error Notification */
    .notification-error {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .notification-error:hover {
      box-shadow: 
        0 32px 64px -12px rgba(239, 68, 68, 0.3),
        0 0 0 1px rgba(239, 68, 68, 0.4);
    }

    /* Warning Notification */
    .notification-warning {
      background: rgba(251, 191, 36, 0.1);
      border-color: rgba(251, 191, 36, 0.3);
    }

    .notification-warning:hover {
      box-shadow: 
        0 32px 64px -12px rgba(251, 191, 36, 0.3),
        0 0 0 1px rgba(251, 191, 36, 0.4);
    }

    /* Info Notification */
    .notification-info {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }

    .notification-info:hover {
      box-shadow: 
        0 32px 64px -12px rgba(59, 130, 246, 0.3),
        0 0 0 1px rgba(59, 130, 246, 0.4);
    }

    .notification-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      font-size: 18px;
      transition: all 0.3s ease;
      animation: iconPulse 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .notification-icon i {
      animation: iconBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      transform-origin: center;
    }

    .icon-success {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      animation: iconPulse 0.6s cubic-bezier(0.16, 1, 0.3, 1), successGlow 2s ease-in-out;
    }

    .icon-success i {
      animation: iconBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), checkmarkDraw 1.2s ease-out;
    }

    .icon-error {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      animation: iconPulse 0.6s cubic-bezier(0.16, 1, 0.3, 1), errorShake 0.8s ease-out;
    }

    .icon-error i {
      animation: iconBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), errorPulse 2s infinite;
    }

    .icon-warning {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
      animation: iconPulse 0.6s cubic-bezier(0.16, 1, 0.3, 1), warningBlink 1.5s ease-in-out infinite;
    }

    .icon-warning i {
      animation: iconBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), warningSwing 2s ease-in-out infinite;
    }

    .icon-info {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
      animation: iconPulse 0.6s cubic-bezier(0.16, 1, 0.3, 1), infoRotate 3s ease-in-out infinite;
    }

    .icon-info i {
      animation: iconBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    /* Icon Animations */
    @keyframes iconPulse {
      0% { 
        transform: scale(0.8);
        opacity: 0;
      }
      50% { 
        transform: scale(1.1);
      }
      100% { 
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes iconBounce {
      0% { 
        transform: scale(0.3) rotate(-180deg);
        opacity: 0;
      }
      50% { 
        transform: scale(1.1) rotate(-10deg);
      }
      100% { 
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }

    @keyframes successGlow {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
      }
      50% { 
        box-shadow: 0 0 20px 5px rgba(34, 197, 94, 0.2);
      }
    }

    @keyframes checkmarkDraw {
      0% { 
        transform: scale(1) rotate(0deg);
      }
      25% { 
        transform: scale(1.2) rotate(5deg);
      }
      50% { 
        transform: scale(0.9) rotate(-5deg);
      }
      100% { 
        transform: scale(1) rotate(0deg);
      }
    }

    @keyframes errorShake {
      0%, 100% { 
        transform: translateX(0);
      }
      25% { 
        transform: translateX(-3px);
      }
      75% { 
        transform: translateX(3px);
      }
    }

    @keyframes errorPulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 1;
      }
      50% { 
        transform: scale(1.05);
        opacity: 0.8;
      }
    }

    @keyframes warningBlink {
      0%, 100% { 
        opacity: 1;
      }
      50% { 
        opacity: 0.7;
      }
    }

    @keyframes warningSwing {
      0%, 100% { 
        transform: rotate(0deg);
      }
      25% { 
        transform: rotate(5deg);
      }
      75% { 
        transform: rotate(-5deg);
      }
    }

    @keyframes infoRotate {
      0%, 100% { 
        transform: rotate(0deg);
      }
      50% { 
        transform: rotate(360deg);
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 15px;
      color: white;
      line-height: 1.3;
      margin-bottom: 2px;
    }

    .notification-message {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.4;
    }

    .notification-close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 12px;
    }

    .notification-close:hover {
      background: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
      transform: scale(1.1);
    }

    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, 
        rgba(251, 191, 36, 0.8), 
        rgba(34, 197, 94, 0.8)
      );
      border-radius: 0 0 16px 16px;
      animation: progressShrink linear forwards;
    }

    @keyframes progressShrink {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .notification-container {
        top: 60px;
        right: 16px;
        left: 16px;
        max-width: none;
      }
      
      .notification-toast {
        min-width: auto;
        max-width: none;
      }
    }

    /* Motion Preferences */
    @media (prefers-reduced-motion: reduce) {
      .notification-toast,
      .notification-close,
      .notification-progress {
        animation: none !important;
        transition: none !important;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();
  
  notifications = signal<NotificationData[]>([]);

  ngOnInit() {
    this.notificationService.notifications
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications.set(notifications);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(id: string) {
    this.notificationService.dismiss(id);
  }

  trackByFn(index: number, item: NotificationData): string {
    return item.id;
  }

  getIconClass(type: string): string {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle', 
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type as keyof typeof icons] || 'fas fa-info-circle';
  }
}