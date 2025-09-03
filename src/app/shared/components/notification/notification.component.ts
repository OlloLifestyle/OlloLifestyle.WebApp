import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { NotificationService, NotificationData } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0, scale: 0.8 }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ transform: 'translateX(0)', opacity: 1, scale: 1 })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateX(100%)', opacity: 0, scale: 0.8 })
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
  ]
})
export class NotificationComponent {
  private notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;

  dismiss(id: string) {
    this.notificationService.dismiss(id);
  }

  trackByFn(index: number, item: NotificationData): string {
    return item.id;
  }

  getIconClass(type: string): string {
    return {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
  }
}
