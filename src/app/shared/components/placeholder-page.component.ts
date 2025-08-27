import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <span class="text-4xl">{{ getPageIcon() }}</span>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ getPageTitle() }}</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">{{ getPageDescription() }}</p>
        </div>

        <!-- Breadcrumb -->
        <nav class="flex mb-8" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <a [routerLink]="['/dashboard']" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                <span class="mr-2">🏠</span>
                Dashboard
              </a>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">{{ getPageTitle() }}</span>
              </div>
            </li>
          </ol>
        </nav>

        <!-- Content Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-8 sm:px-8">
            <!-- Status Badge -->
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
              <span class="mr-2">🚧</span>
              Under Development
            </div>

            <!-- Main Content -->
            <div class="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
                <p class="text-gray-600 mb-6">
                  This {{ getPageTitle().toLowerCase() }} page is currently under development. 
                  We're working hard to bring you powerful features that will enhance your experience.
                </p>
                
                <div class="space-y-3">
                  <div class="flex items-center text-gray-600">
                    <span class="mr-3">✨</span>
                    <span>Modern, responsive design</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <span class="mr-3">⚡</span>
                    <span>Fast and intuitive interface</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <span class="mr-3">🔒</span>
                    <span>Secure and reliable functionality</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <span class="mr-3">📱</span>
                    <span>Mobile-first approach</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Current Route Info</h2>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Path:</span>
                    <span class="text-gray-600 font-mono text-sm">{{ getCurrentPath() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Component:</span>
                    <span class="text-gray-600">PlaceholderPageComponent</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Status:</span>
                    <span class="text-blue-600">Placeholder</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button 
                (click)="goBack()"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <span class="mr-2">←</span>
                Go Back
              </button>
              
              <button 
                (click)="goToDashboard()"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <span class="mr-2">🏠</span>
                Dashboard
              </button>

              <button 
                (click)="logout()"
                class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <span class="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PlaceholderPageComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  getPageIcon(): string {
    const path = this.getCurrentPath();
    const iconMap: Record<string, string> = {
      'analytics': '📊',
      'reports': '📋',
      'live': '⚡',
      'users': '👥',
      'roles': '🔐',
      'groups': '👥',
      'logs': '📝',
      'articles': '✍️',
      'media': '🖼️',
      'categories': '🏷️',
      'comments': '💬',
      'general': '🔧',
      'security': '🛡️',
      'integrations': '🔗',
      'notifications': '🔔'
    };

    const pathSegments = path.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    return iconMap[lastSegment] || '📄';
  }

  getPageTitle(): string {
    const path = this.getCurrentPath();
    const titleMap: Record<string, string> = {
      'analytics': 'Analytics',
      'reports': 'Reports',
      'live': 'Real-time Data',
      'users': 'Users Management',
      'roles': 'User Roles',
      'groups': 'User Groups',
      'logs': 'Access Logs',
      'articles': 'Articles',
      'media': 'Media Library',
      'categories': 'Categories',
      'comments': 'Comments',
      'general': 'General Settings',
      'security': 'Security',
      'integrations': 'Integrations',
      'notifications': 'Notifications'
    };

    const pathSegments = path.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    return titleMap[lastSegment] || 'Page';
  }

  getPageDescription(): string {
    const path = this.getCurrentPath();
    const descriptionMap: Record<string, string> = {
      'analytics': 'Comprehensive analytics dashboard with detailed insights and performance metrics for your application.',
      'reports': 'Generate and view detailed reports to track your business performance and user engagement.',
      'live': 'Monitor real-time data streams and live metrics to stay updated with current system status.',
      'users': 'Manage user accounts, permissions, and access controls for your application.',
      'roles': 'Configure user roles and permissions to control access to different features and data.',
      'groups': 'Organize users into groups for easier management and bulk operations.',
      'logs': 'View and analyze user activity logs and system access patterns for security monitoring.',
      'articles': 'Create, edit, and manage your blog posts and articles with a rich content editor.',
      'media': 'Upload, organize, and manage your images, videos, and other media files.',
      'categories': 'Organize your content with custom categories and tags for better navigation.',
      'comments': 'Moderate and manage user comments and feedback on your content.',
      'general': 'Configure basic application settings and preferences.',
      'security': 'Manage security policies, authentication settings, and access controls.',
      'integrations': 'Connect with third-party services and manage API integrations.',
      'notifications': 'Configure notification preferences and manage alert settings.'
    };

    const pathSegments = path.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    return descriptionMap[lastSegment] || 'This page is currently under development.';
  }

  getCurrentPath(): string {
    return this.router.url;
  }

  goBack(): void {
    window.history.back();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}