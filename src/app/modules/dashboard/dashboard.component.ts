import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-oxford-blue via-oxford-blue/95 to-oxford-blue/90">
      <!-- Header -->
      <header class="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img src="assets/Ollo-Logo.webp" alt="Ollo Logo" class="w-8 h-8 object-contain" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <i class="fas fa-shield-alt text-white text-xl" style="display: none;"></i>
              <h1 class="text-xl font-bold text-white">OLLO Dashboard</h1>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-white/70">
                Welcome, <span class="text-white font-medium">{{ currentUser?.username }}</span>
              </div>
              <button 
                (click)="logout()" 
                class="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors duration-300 border border-red-500/30"
              >
                <i class="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- User Info Card -->
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-peach to-green rounded-full flex items-center justify-center">
                <i class="fas fa-user text-white text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white">User Information</h3>
                <p class="text-white/60 text-sm">Your account details</p>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-white/60">Username:</span>
                <span class="text-white">{{ currentUser?.username }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-white/60">Company:</span>
                <span class="text-white">{{ currentUser?.company }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-white/60">Email:</span>
                <span class="text-white">{{ currentUser?.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-white/60">Roles:</span>
                <span class="text-white">{{ currentUser?.roles?.join(', ') }}</span>
              </div>
            </div>
          </div>

          <!-- System Status Card -->
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-green to-blue-500 rounded-full flex items-center justify-center">
                <i class="fas fa-server text-white text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white">System Status</h3>
                <p class="text-white/60 text-sm">All systems operational</p>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-white/80 text-sm">Authentication Service</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-white/80 text-sm">Database Connection</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-white/80 text-sm">API Gateway</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <i class="fas fa-bolt text-white text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white">Quick Actions</h3>
                <p class="text-white/60 text-sm">Common tasks</p>
              </div>
            </div>
            <div class="space-y-2">
              <button class="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors duration-300">
                <i class="fas fa-chart-bar mr-2"></i>
                View Reports
              </button>
              <button class="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors duration-300">
                <i class="fas fa-cog mr-2"></i>
                Settings
              </button>
              <button class="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors duration-300">
                <i class="fas fa-help-circle mr-2"></i>
                Help & Support
              </button>
            </div>
          </div>
        </div>

        <!-- Welcome Message -->
        <div class="mt-8 bg-gradient-to-r from-peach/20 to-green/20 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-4">Welcome to OLLO Dashboard!</h2>
          <p class="text-white/80 leading-relaxed">
            You have successfully logged in to the OLLO Lifestyle management system. 
            This enterprise-standard authentication system provides secure access to all your textile management tools.
            From here, you can manage your operations, view reports, and access all the features you need.
          </p>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}