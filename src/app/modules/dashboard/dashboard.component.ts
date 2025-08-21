import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  navExpanded = false;
  activeSection = 'dashboard';
  showProfileMenu = false;

  stats = {
    appointments: 57,
    surveys: 18,
    satisfaction: 4.7,
    notifications: 16
  };

  recentNotifications = [
    { type: 'info', message: 'System backup completed' },
    { type: 'warning', message: 'Server maintenance at 2 AM' },
    { type: 'success', message: 'New user registered' }
  ];

  todayAppointments = [
    { time: '9:30 AM', patient: 'William Brooks', type: 'Consultation', status: 'confirmed' },
    { time: '10:45 AM', patient: 'Matthew Lawson', type: 'Follow-up', status: 'pending' },
    { time: '2:15 PM', patient: 'Olivia Scott', type: 'Initial Checkup', status: 'confirmed' }
  ];

  systemActivity = [
    {
      type: 'success',
      icon: 'fas fa-user-plus',
      message: 'New patient registered successfully',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      type: 'info',
      icon: 'fas fa-database',
      message: 'Daily backup completed',
      timestamp: new Date(Date.now() - 600000)
    },
    {
      type: 'warning',
      icon: 'fas fa-exclamation-triangle',
      message: 'Server maintenance scheduled',
      timestamp: new Date(Date.now() - 900000)
    }
  ];

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  expandNav(): void {
    this.navExpanded = true;
  }

  collapseNav(): void {
    this.navExpanded = false;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  logout(): void {
    this.showProfileMenu = false;
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}