import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-modern-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModernInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-group">
      <div class="relative">
        <div *ngIf="icon" class="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center w-6 h-6">
          <i [class]="'fas fa-' + icon + ' text-white/60 transition-colors duration-300 text-sm'"></i>
        </div>
        <input
          [type]="inputType"
          [placeholder]="placeholder"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [class]="inputClasses"
          [disabled]="disabled"
        />
        <button
          *ngIf="type === 'password'"
          type="button"
          (click)="togglePasswordVisibility()"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-all duration-300 z-30 hover:scale-110 flex items-center justify-center w-6 h-6"
        >
          <i [class]="(showPassword ? 'fas fa-eye-slash' : 'fas fa-eye') + ' text-sm'"></i>
        </button>
        <div class="input-glow absolute inset-0 rounded-2xl bg-gradient-to-r from-oxford-blue/20 via-peach/10 to-green/20 opacity-0 transition-all duration-500 pointer-events-none z-0"></div>
      </div>
    </div>
  `,
  styles: [`
    .modern-input {
      width: 100%;
      padding: 1rem;
      padding-left: 3rem;
      padding-right: 1rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 1rem;
      color: white;
      transition: all 0.5s ease;
    }

    .modern-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .modern-input:focus {
      outline: none;
      ring: 2px solid rgba(255, 132, 102, 0.5);
      border-color: rgba(255, 132, 102, 0.5);
    }

    .modern-input.error {
      border-color: rgba(239, 68, 68, 0.6);
      ring: 2px solid rgba(239, 68, 68, 0.3);
    }

    .modern-input:focus + .input-glow {
      opacity: 1;
    }
  `]
})
export class ModernInputComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'password' | 'email' = 'text';
  @Input() icon: string = '';
  @Input() disabled: boolean = false;
  @Input() hasError: boolean = false;

  value: string = '';
  showPassword: boolean = false;
  
  private onChange = (value: string) => {};
  private onTouched = () => {};

  get inputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get inputClasses(): string {
    const baseClasses = 'modern-input w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-peach/50 focus:border-peach/50 transition-all duration-500';
    const errorClasses = this.hasError ? ' error' : '';
    const passwordClasses = this.type === 'password' ? ' pr-12' : '';
    
    return baseClasses + errorClasses + passwordClasses;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}