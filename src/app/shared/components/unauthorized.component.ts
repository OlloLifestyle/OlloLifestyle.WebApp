import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-oxford-blue">
      <div class="text-center">
        <div class="mb-8">
          <i class="fas fa-shield-alt text-6xl text-red-400 mb-4"></i>
        </div>
        <h1 class="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p class="text-white/70 mb-8 max-w-md">
          You don't have permission to access this resource. 
          Please contact your administrator if you believe this is an error.
        </p>
        <button 
          routerLink="/dashboard" 
          class="bg-peach hover:bg-peach/80 text-white px-6 py-3 rounded-lg transition-colors duration-300"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}