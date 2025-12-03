import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService, AuthError } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoginCredentials, AuthenticateRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
  availableCompanies: Array<{ id: number; name: string }> = [];
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
      username: ['admin@acme.com', [Validators.required, Validators.minLength(3)]],
      company: [{ value: '', disabled: true }, []],
      password: ['Admin123!', [Validators.required, Validators.minLength(6)]]
    });

    this.isAuthenticated = false;
    this.availableCompanies = [];
    this.authenticatedUser = null;
  }

  private setupAnimations(): void {
    setTimeout(() => {
      this.mounted = true;
      const container = document.querySelector('.login-container') as HTMLElement;
      if (container) container.classList.add('animate-in');
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
      this.authenticateUser();
    } else {
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

    this.authService.authenticate(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isAuthenticated = true;
          this.authenticatedUser = response.user;
          this.availableCompanies = response.companies;

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
        error: (error: AuthError | HttpErrorResponse | unknown) => {
          const errorMsg = this.resolveAuthErrorMessage(error, 'Authentication failed. Please check your credentials.');
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
          error: (error: AuthError | HttpErrorResponse | unknown) => {
            const errorMsg = this.resolveAuthErrorMessage(error, 'Login failed. Please check your credentials.');
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

  // 🔹 Helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: { [key: string]: string } = {
      username: 'Username',
      company: 'Company',
      password: 'Password'
    };
    return names[fieldName] || fieldName;
  }

  private resolveAuthErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof AuthError && error.message) {
      return error.message;
    }

    if (error && typeof (error as any).message === 'string' && (error as any).message.trim()) {
      return (error as any).message;
    }

    return fallback;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  clearForm(): void {
    this.loginForm.reset();
  }

  onEnterKey(event: KeyboardEvent, nextField?: string): void {
    if (event.key === 'Enter') {
      if (nextField) {
        const nextElement = document.querySelector(`[formControlName="${nextField}"]`) as HTMLInputElement;
        if (nextElement && !nextElement.disabled) {
          event.preventDefault();
          nextElement.focus();
        }
      } else {
        this.onSubmit();
      }
    }
  }

  getButtonLabel(): string {
    return !this.isAuthenticated ? 'Authenticate' : 'Login';
  }

  getLoadingMessage(): string {
    return !this.isAuthenticated ? 'Authenticating...' : 'Logging in...';
  }

  isCurrentStepValid(): boolean {
    if (!this.isAuthenticated) {
      return this.loginForm.get('username')?.valid && this.loginForm.get('password')?.valid || false;
    } else {
      return this.loginForm.valid;
    }
  }

  private showErrorState(): void {
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (container) {
      container.style.border = '1px solid rgba(239, 68, 68, 0.6)';
      container.style.boxShadow = '0 32px 64px -12px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.3)';
      setTimeout(() => this.resetPanelState(), 4000);
    }
  }

  private showSuccessState(): void {
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (container) {
      container.style.border = '1px solid rgba(34, 197, 94, 0.6)';
      container.style.boxShadow = '0 32px 64px -12px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(34, 197, 94, 0.3)';
    }
  }

  private resetPanelState(): void {
    const container = document.querySelector('.login-panel') as HTMLElement;
    if (container) {
      container.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      container.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4)';
    }
  }
}
