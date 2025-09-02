import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoginCredentials, AuthenticateRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  loginForm!: FormGroup;
  showPassword = false;
  mounted = false;
  
  // Two-step authentication state
  isAuthenticated = false;
  availableCompanies: Array<{id: number, name: string}> = [];
  authenticatedUser: any = null;

  // Observables
  isLoading$ = this.authService.isLoading$;

  ngOnInit(): void {
    this.initializeForm();
    this.setupAnimations();
    this.setupParallax();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('mousemove', this.handleParallax);
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      company: [{value: '', disabled: true}, []], // Disabled initially until authenticated
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Reset state
    this.isAuthenticated = false;
    this.availableCompanies = [];
    this.authenticatedUser = null;
  }

  private setupAnimations(): void {
    setTimeout(() => {
      this.mounted = true;
      const container = document.querySelector('.login-container') as HTMLElement;
      if (container) {
        container.classList.add('animate-in');
      }
    }, 100);
  }

  private setupParallax(): void {
    window.addEventListener('mousemove', this.handleParallax);
  }

  private handleParallax = (event: MouseEvent): void => {
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (!container) return;
    
    const backgroundElements = container.querySelectorAll('.absolute:not(.input-glow):not([data-no-parallax])');
    const x = (event.clientX / window.innerWidth - 0.5) * 5;
    const y = (event.clientY / window.innerHeight - 0.5) * 5;
    
    backgroundElements.forEach((el: any) => {
      if (!el.closest('.input-group') && !el.querySelector('i.fas')) {
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  };

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.isAuthenticated) {
      // Step 1: Authenticate with username + password
      this.authenticateUser();
    } else {
      // Step 2: Complete login with selected company
      this.loginWithCompany();
    }
  }
  
  private authenticateUser(): void {
    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;
    
    if (!username || !password) {
      this.notificationService.warning(
        'Authentication Required',
        'Please enter your username and password.',
        { duration: 4000 }
      );
      return;
    }
    
    const request: AuthenticateRequest = {
      username: username.trim(),
      password: password.trim()
    };

    // Track if authentication succeeded to show error notification if needed
    let authSucceeded = false;
    
    // Set a timeout to show error notification if no success after reasonable time
    const errorTimeout = setTimeout(() => {
      if (!authSucceeded) {
        this.showErrorState();
        this.notificationService.error(
          'Authentication Failed',
          'Invalid username or password. Please check your credentials.',
          { duration: 5000 }
        );
      }
    }, 3000);

    this.authService.authenticate(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          authSucceeded = true;
          clearTimeout(errorTimeout);
          
          // Step 1 successful - show companies and enable company field
          this.isAuthenticated = true;
          this.authenticatedUser = response.user;
          this.availableCompanies = response.companies;
          
          // Enable and add validation to company field
          const companyControl = this.loginForm.get('company');
          companyControl?.enable();
          companyControl?.setValidators([Validators.required]);
          companyControl?.updateValueAndValidity();
          
          this.notificationService.success(
            'Authentication Successful!',
            'Please select your company to continue.',
            { duration: 3000 }
          );
        },
        error: (error) => {
          authSucceeded = true; // Prevent timeout from triggering
          clearTimeout(errorTimeout);
          const errorMsg = error.message || 'Authentication failed. Please check your credentials.';
          this.showErrorState();
          this.notificationService.error(
            'Authentication Failed',
            errorMsg,
            { duration: 5000 }
          );
        }
      });
  }
  
  private loginWithCompany(): void {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      
      // Find selected company name from the companies list
      const selectedCompany = this.availableCompanies.find(c => c.id.toString() === formValue.company);
      
      const credentials: LoginCredentials = {
        username: formValue.username.trim(),
        company: selectedCompany?.name || formValue.company,
        password: formValue.password.trim()
      };

      this.authService.login(credentials)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.showSuccessState();
            this.notificationService.success(
              'Login Successful!',
              `Welcome ${response.user.firstName} ${response.user.lastName}. Redirecting to dashboard...`,
              { duration: 2000 }
            );
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1500);
          },
          error: (error) => {
            const errorMsg = error.message || 'Login failed. Please check your credentials.';
            this.showErrorState();
            this.notificationService.error(
              'Login Failed',
              errorMsg,
              { duration: 6000 }
            );
          }
        });
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning(
        'Company Selection Required',
        'Please select a company to continue.',
        { duration: 4000 }
      );
    }
  }

  /**
   * Get form control validation state
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get specific field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }

  /**
   * Get display name for field
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Username',
      company: 'Company',
      password: 'Password'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Clear form
   */
  clearForm(): void {
    this.loginForm.reset();
  }

  /**
   * Handle enter key navigation
   */
  onEnterKey(event: KeyboardEvent, nextField?: string): void {
    if (event.key === 'Enter') {
      if (nextField) {
        // Navigate to next field if enabled
        if (nextField === 'password' || (nextField === 'company' && this.isAuthenticated)) {
          event.preventDefault();
          const nextElement = document.querySelector(`[formControlName="${nextField}"]`) as HTMLInputElement;
          if (nextElement && !nextElement.disabled) {
            nextElement.focus();
          }
        }
      } else {
        // Submit form
        this.onSubmit();
      }
    }
  }
  
  /**
   * Get current button label based on authentication state
   */
  getButtonLabel(): string {
    if (!this.isAuthenticated) {
      return 'Authenticate';
    }
    return 'Login';
  }
  
  /**
   * Get loading message based on authentication state
   */
  getLoadingMessage(): string {
    if (!this.isAuthenticated) {
      return 'Authenticating...';
    }
    return 'Logging in...';
  }
  
  /**
   * Check if form is valid for current step
   */
  isCurrentStepValid(): boolean {
    if (!this.isAuthenticated) {
      // Step 1: Only username and password required
      const username = this.loginForm.get('username');
      const password = this.loginForm.get('password');
      return !!(username?.valid && password?.valid);
    } else {
      // Step 2: All fields required
      return this.loginForm.valid;
    }
  }

  private showErrorState(): void {
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (container) {
      // Add red border and glow effect
      container.style.border = '1px solid rgba(239, 68, 68, 0.6)';
      container.style.boxShadow = '0 32px 64px -12px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)';
      
      // Reset to normal after 4 seconds
      setTimeout(() => {
        this.resetPanelState();
      }, 4000);
    }
  }

  private showSuccessState(): void {
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (container) {
      // Add green border and glow effect
      container.style.border = '1px solid rgba(34, 197, 94, 0.6)';
      container.style.boxShadow = '0 32px 64px -12px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)';
    }
  }

  private resetPanelState(): void {
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (container) {
      // Reset to original styling
      container.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      container.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)';
    }
  }

}