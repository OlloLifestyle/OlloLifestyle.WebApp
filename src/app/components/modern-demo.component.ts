import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, keyframes, query, stagger, group } from '@angular/animations';
import { NotificationTestComponent } from '../shared/components/notification-test.component';

@Component({
  selector: 'app-modern-demo',
  standalone: true,
  imports: [CommonModule, NotificationTestComponent],
  animations: [
    // Fade in animation with stagger effect for lists
    trigger('fadeInStagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    
    // Scale and fade animation for cards
    trigger('cardAnimation', [
      state('hidden', style({ opacity: 0, transform: 'scale(0.8) rotateY(-20deg)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1) rotateY(0deg)' })),
      transition('hidden => visible', [
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
      transition('visible => hidden', [
        animate('200ms ease-in')
      ])
    ]),
    
    // Pulse animation for notifications
    trigger('pulseAnimation', [
      state('idle', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.05)' })),
      transition('idle => pulse', [
        animate('200ms ease-out')
      ]),
      transition('pulse => idle', [
        animate('200ms ease-in')
      ])
    ]),
    
    // Slide animation for modals/panels
    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0.0, 1, 1)', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-oxford-blue via-oxford-blue to-blue-900 p-8">
      
      <!-- Header Section -->
      <div class="max-w-6xl mx-auto">
        <header class="text-center mb-12" [@fadeInStagger]="headerItems()">
          <h1 class="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-peach bg-clip-text text-transparent">
            Modern Angular + TailwindCSS
          </h1>
          <p class="text-xl text-white/80 max-w-2xl mx-auto">
            Showcasing 2025 best practices with accessibility, animations, and PWA features
          </p>
        </header>

        <!-- Feature Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" [@fadeInStagger]="cardItems()">
          <div 
            *ngFor="let card of cards(); let i = index" 
            class="card p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
            [@cardAnimation]="cardStates()[i]"
            (click)="toggleCard(i)"
            [class.motion-safe:hover:scale-105]="!isReducedMotion"
            role="button"
            [attr.aria-expanded]="cardStates()[i] === 'visible'"
            tabindex="0"
            (keydown.enter)="toggleCard(i)"
            (keydown.space)="toggleCard(i)">
            
            <div class="flex items-center mb-4">
              <div [ngClass]="card.iconClass" 
                   class="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4 
                          transition-transform duration-200 group-hover:rotate-12">
                {{ card.icon }}
              </div>
              <h3 class="text-xl font-semibold text-white">{{ card.title }}</h3>
            </div>
            
            <p class="text-white/70 mb-4">{{ card.description }}</p>
            
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let tag of card.tags" 
                    class="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full 
                           backdrop-blur-sm border border-white/20">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Interactive Demo Section -->
        <div class="card p-8 mb-8">
          <h2 class="text-3xl font-bold text-white mb-6">Interactive Features</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Button Demos -->
            <div>
              <h3 class="text-xl font-semibold text-white mb-4">Modern Buttons</h3>
              <div class="space-y-4">
                <button 
                  class="btn-primary w-full motion-safe:hover:shadow-lg motion-safe:hover:shadow-peach/20"
                  [@pulseAnimation]="buttonState()"
                  (click)="pulseButton()">
                  Primary Action
                </button>
                
                <button 
                  class="w-full px-6 py-3 bg-transparent border-2 border-white/30 text-white rounded-lg 
                         transition-all duration-200 hover:border-white/60 hover:bg-white/5 
                         focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 
                         focus:ring-offset-oxford-blue motion-safe:hover:scale-[1.02] active:scale-[0.98]">
                  Secondary Action
                </button>
                
                <button 
                  class="w-full px-6 py-3 bg-gradient-to-r from-green to-emerald-500 text-white rounded-lg 
                         transition-all duration-200 hover:from-green/90 hover:to-emerald-500/90 
                         focus:outline-none focus:ring-2 focus:ring-green/50 focus:ring-offset-2 
                         focus:ring-offset-oxford-blue motion-safe:hover:scale-[1.02] active:scale-[0.98]">
                  Success Action
                </button>
              </div>
            </div>

            <!-- Form Demo -->
            <div>
              <h3 class="text-xl font-semibold text-white mb-4">Accessible Forms</h3>
              <form class="space-y-4" (submit)="handleSubmit($event)">
                <div>
                  <label for="email" class="block text-sm font-medium text-white/80 mb-2">
                    Email Address
                  </label>
                  <input 
                    id="email"
                    type="email" 
                    class="w-full px-4 py-3 bg-white/5 border border-white/20 text-white rounded-lg 
                           placeholder-white/50 transition-all duration-200 
                           focus:outline-none focus:ring-2 focus:ring-peach/50 focus:border-peach/50
                           hover:border-white/40"
                    placeholder="you@example.com"
                    [class.input-error]="hasError()"
                    (blur)="validateEmail($event)">
                </div>
                
                <div>
                  <label for="message" class="block text-sm font-medium text-white/80 mb-2">
                    Message
                  </label>
                  <textarea 
                    id="message"
                    rows="3"
                    class="w-full px-4 py-3 bg-white/5 border border-white/20 text-white rounded-lg 
                           placeholder-white/50 transition-all duration-200 
                           focus:outline-none focus:ring-2 focus:ring-peach/50 focus:border-peach/50
                           hover:border-white/40 resize-none"
                    placeholder="Your message here..."></textarea>
                </div>
                
                <button type="submit" class="btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Side Panel Demo -->
        <div class="card p-6 mb-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-white">Slide Panel Demo</h3>
            <button 
              (click)="togglePanel()"
              class="px-4 py-2 bg-peach/20 text-peach border border-peach/30 rounded-lg 
                     transition-all duration-200 hover:bg-peach/30 focus:outline-none focus:ring-2 focus:ring-peach/50">
              {{ showPanel() ? 'Hide' : 'Show' }} Panel
            </button>
          </div>
          
          <div class="relative h-32 bg-white/5 rounded-lg overflow-hidden">
            <div 
              *ngIf="showPanel()" 
              [@slideAnimation]
              class="absolute inset-0 bg-gradient-to-r from-peach/20 to-green/20 p-4 flex items-center justify-center">
              <p class="text-white font-medium">✨ Animated slide panel content!</p>
            </div>
          </div>
        </div>

        <!-- Accessibility Info -->
        <div class="card p-6">
          <h3 class="text-xl font-semibold text-white mb-4">🌟 Accessibility Features</h3>
          <ul class="space-y-2 text-white/80">
            <li>• <code class="text-peach">prefers-reduced-motion</code> support for animations</li>
            <li>• <code class="text-peach">prefers-contrast: high</code> mode compatibility</li>
            <li>• Keyboard navigation with focus indicators</li>
            <li>• ARIA attributes and semantic HTML</li>
            <li>• Screen reader friendly announcements</li>
          </ul>
        </div>

        <!-- PWA Testing Component -->
        <div class="card p-6">
          <app-notification-test></app-notification-test>
        </div>
      </div>
    </div>
  `
})
export class ModernDemoComponent {
  // Reactive signals for state management
  cards = signal([
    {
      title: 'TailwindCSS',
      description: 'Utility-first CSS framework with JIT compilation',
      icon: '🎨',
      iconClass: 'bg-gradient-to-br from-blue-500 to-purple-600',
      tags: ['CSS', 'Utilities', 'Responsive']
    },
    {
      title: 'Angular Animations',
      description: 'Smooth, performant animations with Web Animations API',
      icon: '🎭',
      iconClass: 'bg-gradient-to-br from-red-500 to-pink-600',
      tags: ['Animations', 'Performance', 'Accessibility']
    },
    {
      title: 'PWA Features',
      description: 'Offline support, push notifications, and installability',
      icon: '📱',
      iconClass: 'bg-gradient-to-br from-green-500 to-teal-600',
      tags: ['PWA', 'Offline', 'Native']
    },
    {
      title: 'Modern TypeScript',
      description: 'Type-safe development with latest TS features',
      icon: '⚡',
      iconClass: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      tags: ['TypeScript', 'Type Safety', 'DX']
    },
    {
      title: 'Signals',
      description: 'Angular\'s reactive primitives for better performance',
      icon: '🚀',
      iconClass: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      tags: ['Signals', 'Reactivity', 'Performance']
    },
    {
      title: 'Accessibility',
      description: 'WCAG compliant with screen reader support',
      icon: '♿',
      iconClass: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      tags: ['A11y', 'WCAG', 'Inclusive']
    }
  ]);

  cardStates = signal(['visible', 'visible', 'visible', 'visible', 'visible', 'visible']);
  headerItems = signal(['header']);
  cardItems = signal(['cards']);
  showPanel = signal(false);
  buttonState = signal('idle');
  isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  hasError = signal(false);

  toggleCard(index: number) {
    const states = this.cardStates();
    states[index] = states[index] === 'visible' ? 'hidden' : 'visible';
    this.cardStates.set([...states]);
  }

  togglePanel() {
    this.showPanel.update(show => !show);
  }

  pulseButton() {
    this.buttonState.set('pulse');
    setTimeout(() => this.buttonState.set('idle'), 200);
  }

  validateEmail(event: Event) {
    const email = (event.target as HTMLInputElement).value;
    const isValid = email.includes('@') && email.includes('.');
    this.hasError.set(!isValid && email.length > 0);
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    console.log('Form submitted with modern validation!');
  }
}