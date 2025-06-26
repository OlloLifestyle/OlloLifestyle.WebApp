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
  isLoginActive = true;
  loginEmail = '';
  loginPassword = '';
  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  ngOnInit() {
    window.addEventListener('mousemove', this.handleParallax);
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.handleParallax);
  }

  handleParallax = (event: MouseEvent) => {
    const container = document.querySelector('.auth-container') as HTMLElement;
    if (!container) return;
    const x = (event.clientX / window.innerWidth - 0.5) * 30; // max 15px left/right
    const y = (event.clientY / window.innerHeight - 0.5) * 30; // max 15px up/down
    container.style.transform = `translate(${x}px, ${y}px)`;
  };

  showLoginForm() {
    this.isLoginActive = true;
    this.setActiveForm('login');
  }

  showRegisterForm() {
    this.isLoginActive = false;
    this.setActiveForm('register');
  }

  private setActiveForm(form: 'login' | 'register') {
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const loginBtn = document.getElementById('mobileLoginBtn');
    const registerBtn = document.getElementById('mobileRegisterBtn');

    if (form === 'login') {
      loginForm?.classList.add('active');
      registerForm?.classList.remove('active');
      loginBtn?.classList.add('active');
      registerBtn?.classList.remove('active');
    } else {
      loginForm?.classList.remove('active');
      registerForm?.classList.add('active');
      loginBtn?.classList.remove('active');
      registerBtn?.classList.add('active');
    }
  }

  onLoginSubmit() {
    console.log('Login Submitted', this.loginEmail, this.loginPassword);
  }

  onRegisterSubmit() {
    console.log('Register Submitted', this.registerUsername, this.registerEmail);
    if (this.registerPassword !== this.registerConfirmPassword) {
      alert('Passwords do not match');
      return;
    }
  }
}
