import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModernDemoComponent } from '../../components/modern-demo.component';
import { OfflineStatusComponent } from '../../shared/components/offline-status.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ModernDemoComponent, OfflineStatusComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  
  currentUser = signal<User | null>(null);
  showModernDemo = signal(true);

  ngOnInit() {
    // Get current user
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser.set(user);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDemo() {
    this.showModernDemo.update(show => !show);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}