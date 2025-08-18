import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
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
    
    const x = (event.clientX / window.innerWidth - 0.5) * 10; // Reduced intensity
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    
    container.style.transform = `translate(${x}px, ${y}px)`;
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
      // Simulate API call
      await this.performLogin();
      
      // Success handling
      console.log('Login Successful', {
        company: this.loginCompany,
        user: this.loginUser,
        // Don't log password in production
      });
      
      this.showSuccessMessage('Login successful! Redirecting...');
      
      // Redirect logic would go here
      setTimeout(() => {
        // Example: this.router.navigate(['/dashboard']);
        console.log('Redirecting to dashboard...');
      }, 1500);
      
    } catch (error) {
      console.error('Login failed:', error);
      this.showErrorMessage('Login failed. Please check your credentials.');
    } finally {
      this.isLoading = false;
    }
  }

  private async performLogin(): Promise<void> {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure based on dummy credentials
        if (this.loginCompany === 'demo' && this.loginUser === 'admin' && this.loginPassword === 'password') {
          resolve();
        } else {
          // For demo purposes, always resolve after delay
          resolve();
          // In production, you might reject: reject(new Error('Invalid credentials'));
        }
      }, 2000);
    });
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