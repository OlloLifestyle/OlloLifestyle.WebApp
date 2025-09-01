import { Injectable, signal, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  lottieAnimation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly config = inject(ConfigService);
  private notifications$ = new BehaviorSubject<NotificationData[]>([]);
  
  public notifications = this.notifications$.asObservable();

  show(notification: Omit<NotificationData, 'id'>): string {
    const id = this.generateId();
    const newNotification: NotificationData = {
      id,
      duration: 5000,
      lottieAnimation: this.config.lottieAnimations[notification.type],
      ...notification
    };

    // Debug logging to track duplicate notifications
    console.log(`[NotificationService] Creating notification: ${notification.title}`, {
      id,
      type: notification.type,
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack
    });

    const current = this.notifications$.value;
    
    // Check for potential duplicates (same title and type)
    const recentDuplicate = current.find(n => 
      n.title === notification.title && 
      n.type === notification.type
    );
    
    if (recentDuplicate) {
      console.warn(`[NotificationService] Duplicate notification blocked for: ${notification.title}`, {
        existingId: recentDuplicate.id,
        blockedId: id
      });
      // Return the existing notification ID instead of creating a duplicate
      return recentDuplicate.id;
    }

    this.notifications$.next([...current, newNotification]);

    // Auto-dismiss if not persistent
    if (!newNotification.persistent) {
      setTimeout(() => {
        this.dismiss(id);
      }, newNotification.duration);
    }

    return id;
  }

  success(title: string, message?: string, options?: Partial<NotificationData>): string {
    return this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  error(title: string, message?: string, options?: Partial<NotificationData>): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer for errors
      ...options
    });
  }

  warning(title: string, message?: string, options?: Partial<NotificationData>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  info(title: string, message?: string, options?: Partial<NotificationData>): string {
    return this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  dismiss(id: string): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }

  dismissAll(): void {
    this.notifications$.next([]);
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}