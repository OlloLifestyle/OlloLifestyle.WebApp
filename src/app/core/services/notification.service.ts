import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  private notifications$ = new BehaviorSubject<NotificationData[]>([]);
  
  public notifications = this.notifications$.asObservable();

  private lottieAnimations = {
    success: 'https://lottie.host/4d6e93e8-7333-4a5e-9c89-6c5c9c5c5c5c/animation.json', // Success checkmark
    error: 'https://lottie.host/8b2f6a1c-4d8f-4c3b-9a7e-1e2f3g4h5i6j/animation.json',   // Error X
    warning: 'https://lottie.host/1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6/animation.json', // Warning triangle
    info: 'https://lottie.host/6f7g8h9i-0j1k-2l3m-4n5o-p6q7r8s9t0u1/animation.json'      // Info circle
  };

  show(notification: Omit<NotificationData, 'id'>): string {
    const id = this.generateId();
    const newNotification: NotificationData = {
      id,
      duration: 5000,
      lottieAnimation: this.lottieAnimations[notification.type],
      ...notification
    };

    const current = this.notifications$.value;
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