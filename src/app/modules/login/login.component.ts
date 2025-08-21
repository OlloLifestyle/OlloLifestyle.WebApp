import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginCredentials } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  // Form data
  loginCompany = '';
  loginUser = '';
  loginPassword = '';
  
  // UI states
  isLoading = false;
  showPassword = false;
  mounted = false;

  ngOnInit() {
    window.addEventListener('mousemove', this.handleParallax);
    
    // Add smooth entrance animation
    setTimeout(() => {
      this.mounted = true;
      const container = document.querySelector('.login-container') as HTMLElement;
      if (container) {
        container.classList.add('animate-in');
      }
    }, 100);
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.handleParallax);
  }

  handleParallax = (event: MouseEvent) => {
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (!container || this.isLoading) return;
    
    // Only apply parallax to decorative background elements, exclude all input-related elements
    const backgroundElements = container.querySelectorAll('.absolute');
    
    const x = (event.clientX / window.innerWidth - 0.5) * 5;
    const y = (event.clientY / window.innerHeight - 0.5) * 5;
    
    backgroundElements.forEach((el: any) => {
      // Skip all input-related elements: icons, buttons, glow effects
      if (el.classList.contains('input-glow') || 
          el.querySelector('i.fas') || 
          el.tagName === 'BUTTON' ||
          el.closest('.input-group')) {
        return;
      }
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  };

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLoginSubmit() {
    // Basic validation
    if (!this.loginCompany.trim() || !this.loginUser.trim() || !this.loginPassword.trim()) {
      this.showErrorMessage('Please fill in all fields');
      return;
    }

    this.isLoading = true;
    
    try {
      const credentials: LoginCredentials = {
        company: this.loginCompany.trim(),
        user: this.loginUser.trim(),
        password: this.loginPassword.trim()
      };

      await this.authService.login(credentials);
      
      this.showSuccessMessage('Login successful! Redirecting...');
      
      // For now, just show success message since no dashboard exists yet
      setTimeout(() => {
        console.log('Login successful - ready for dashboard navigation');
        // this.router.navigate(['/dashboard']); // Uncomment when dashboard is implemented
      }, 1500);
      
    } catch (error) {
      console.error('Login failed:', error);
      this.showErrorMessage('Login failed. Please check your credentials.');
    } finally {
      this.isLoading = false;
    }
  }


  private showErrorMessage(message: string) {
    // In a real app, you might use a toast service or modal
    console.error(message);
    
    // Add temporary visual feedback
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (container) {
      container.style.boxShadow = '0 32px 64px -12px rgba(255, 71, 87, 0.4), 0 0 0 1px rgba(255, 71, 87, 0.3)';
      setTimeout(() => {
        container.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
      }, 2000);
    }
  }

  private showSuccessMessage(message: string) {
    console.log(message);
    
    // Add success visual feedback
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (container) {
      container.style.boxShadow = '0 32px 64px -12px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(34, 197, 94, 0.3)';
      setTimeout(() => {
        container.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
      }, 2000);
    }
  }

  // Utility method for form validation
  isFieldInvalid(fieldName: string, form: any): boolean {
    const field = form.controls[fieldName];
    return field?.invalid && (field?.dirty || field?.touched);
  }

  // Clear form method
  clearForm() {
    this.loginCompany = '';
    this.loginUser = '';
    this.loginPassword = '';
  }

  // Method to handle enter key navigation
  onEnterKey(event: KeyboardEvent, nextElement?: string) {
    if (event.key === 'Enter' && nextElement) {
      event.preventDefault();
      const next = document.querySelector(`[name="${nextElement}"]`) as HTMLInputElement;
      if (next) {
        next.focus();
      }
    }
  }
}