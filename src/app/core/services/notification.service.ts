import { Injectable, inject, signal } from '@angular/core';
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

  private readonly _notifications = signal<NotificationData[]>([]);
  readonly notifications = this._notifications.asReadonly();

  show(notification: Omit<NotificationData, 'id'>): string {
    console.log('NotificationService.show() called:', notification);
    
    const id = this.generateId();
    const newNotification: NotificationData = {
      id,
      duration: 5000,
      lottieAnimation: this.config.lottieAnimations[notification.type],
      ...notification
    };

    const current = this._notifications();
    const duplicate = current.find(
      n => n.title === notification.title && n.type === notification.type
    );

    if (duplicate) {
      console.warn('Duplicate notification blocked:', notification.title, notification.type);
      return duplicate.id;
    }

    console.log('Adding notification to list. Current count:', current.length);
    this._notifications.set([...current, newNotification]);
    console.log('Notification added. New count:', this._notifications().length);

    if (!newNotification.persistent) {
      setTimeout(() => this.dismiss(id), newNotification.duration);
    }

    return id;
  }

  success(title: string, message?: string, options?: Partial<NotificationData>) {
    return this.show({ type: 'success', title, message, ...options });
  }

  error(title: string, message?: string, options?: Partial<NotificationData>) {
    return this.show({ type: 'error', title, message, duration: 8000, ...options });
  }

  warning(title: string, message?: string, options?: Partial<NotificationData>) {
    return this.show({ type: 'warning', title, message, ...options });
  }

  info(title: string, message?: string, options?: Partial<NotificationData>) {
    return this.show({ type: 'info', title, message, ...options });
  }

  dismiss(id: string) {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }

  dismissAll() {
    this._notifications.set([]);
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
