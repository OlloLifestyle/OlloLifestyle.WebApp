import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
import { LottieComponent } from 'ngx-lottie';

interface MegaMenuItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: MegaMenuSubItem[];
}

interface MegaMenuSubItem {
  title: string;
  description: string;
  route: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, LottieComponent],
  templateUrl: './mega-menu.component.html',
  styleUrls: ['./mega-menu.component.css'],
  animations: [
    // Stagger animation for all icons
    trigger('staggerIcons', [
      transition(':enter', [
        query('div', [
          style({ opacity: 0, transform: 'translateY(20px) scale(0.8)' }),
          stagger(100, [
            animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0) scale(1)' })
            )
          ])
        ], { optional: true })
      ])
    ]),
    
    // Creative floating animation for icons
    trigger('iconFloat', [
      state('float1', style({ transform: 'translateY(0px)' })),
      state('float2', style({ transform: 'translateY(0px)' })),
      state('float3', style({ transform: 'translateY(0px)' })),
      state('float4', style({ transform: 'translateY(0px)' })),
      state('float5', style({ transform: 'translateY(0px)' })),
      transition('* => *', [
        animate('3s ease-in-out', keyframes([
          style({ transform: 'translateY(0px)', offset: 0 }),
          style({ transform: 'translateY(-3px)', offset: 0.5 }),
          style({ transform: 'translateY(0px)', offset: 1 })
        ]))
      ])
    ]),
    
    // Hover scale animation
    trigger('iconHover', [
      state('default', style({ transform: 'scale(1) rotate(0deg)' })),
      state('hover', style({ transform: 'scale(1.15) rotate(-5deg)' })),
      transition('default <=> hover', animate('300ms cubic-bezier(0.35, 0, 0.25, 1)'))
    ]),
    
    // 🔔 Bell swing with springy overshoot
    trigger('bellSwing', [
      state('default', style({ transform: 'rotate(0deg) scale(1)', transformOrigin: 'top center' })),
      state('swing', style({ transform: 'rotate(0deg) scale(1)', transformOrigin: 'top center' })),
      transition('default => swing', [
        animate('1200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', keyframes([
          style({ transform: 'rotate(0deg) scale(1)', offset: 0 }),
          style({ transform: 'rotate(-25deg) scale(1.1)', offset: 0.3 }),
          style({ transform: 'rotate(20deg) scale(1.05)', offset: 0.6 }),
          style({ transform: 'rotate(-10deg) scale(1.02)', offset: 0.8 }),
          style({ transform: 'rotate(0deg) scale(1)', offset: 1 })
        ]))
      ]),
      transition('swing => default', [
        animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')
      ])
    ]),
    
    // 🌐 Globe orbit with tilt + spin
    trigger('globeOrbit', [
      state('default', style({ transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)' })),
      state('orbit', style({ transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)' })),
      transition('default => orbit', [
        animate('2000ms ease-in-out', keyframes([
          style({ transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)', offset: 0 }),
          style({ transform: 'rotateX(-15deg) rotateY(90deg) rotateZ(10deg)', offset: 0.25 }),
          style({ transform: 'rotateX(-25deg) rotateY(180deg) rotateZ(0deg)', offset: 0.5 }),
          style({ transform: 'rotateX(-15deg) rotateY(270deg) rotateZ(-10deg)', offset: 0.75 }),
          style({ transform: 'rotateX(0deg) rotateY(360deg) rotateZ(0deg)', offset: 1 })
        ]))
      ])
    ]),
    
    // Orbiting dot animation
    trigger('orbitingDot', [
      state('default', style({ transform: 'translateX(0px) translateY(0px)' })),
      state('orbit', style({ transform: 'translateX(0px) translateY(0px)' })),
      transition('default => orbit', [
        animate('2000ms linear', keyframes([
          style({ transform: 'translateX(0px) translateY(-8px)', offset: 0 }),
          style({ transform: 'translateX(8px) translateY(0px)', offset: 0.25 }),
          style({ transform: 'translateX(0px) translateY(8px)', offset: 0.5 }),
          style({ transform: 'translateX(-8px) translateY(0px)', offset: 0.75 }),
          style({ transform: 'translateX(0px) translateY(-8px)', offset: 1 })
        ]))
      ])
    ]),
    
    // 🌙 Moon phases with masking
    trigger('moonPhases', [
      state('default', style({ transform: 'scale(1)' })),
      state('phases', style({ transform: 'scale(1)' })),
      transition('default => phases', [
        animate('1500ms ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.33 }),
          style({ transform: 'scale(1.2)', offset: 0.66 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),
    
    // Moon mask for phases
    trigger('moonMask', [
      state('default', style({ 
        transform: 'translateX(100%)', 
        opacity: 0 
      })),
      state('waning', style({ 
        transform: 'translateX(0%)', 
        opacity: 0.7 
      })),
      transition('default => waning', [
        animate('1500ms ease-in-out', keyframes([
          style({ transform: 'translateX(100%)', opacity: 0, offset: 0 }),
          style({ transform: 'translateX(50%)', opacity: 0.3, offset: 0.33 }),
          style({ transform: 'translateX(0%)', opacity: 0.7, offset: 0.66 }),
          style({ transform: 'translateX(-50%)', opacity: 0.3, offset: 1 })
        ]))
      ])
    ]),
    
    // ⚙️ Settings gear spin with easing & snap-back
    trigger('gearSpin', [
      state('default', style({ transform: 'rotate(0deg)' })),
      state('spin', style({ transform: 'rotate(0deg)' })),
      transition('default => spin', [
        animate('1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', keyframes([
          style({ transform: 'rotate(0deg)', offset: 0 }),
          style({ transform: 'rotate(270deg)', offset: 0.7 }),
          style({ transform: 'rotate(360deg)', offset: 1 })
        ]))
      ]),
      transition('spin => default', [
        animate('300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ transform: 'rotate(0deg)' })
        )
      ])
    ]),
    
    // 👤 User heartbeat pulse with subtle glow
    trigger('userHeartbeat', [
      state('default', style({ transform: 'scale(1)' })),
      state('heartbeat', style({ transform: 'scale(1)' })),
      transition('default => heartbeat', [
        animate('1000ms ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.05)', offset: 0.14 }),
          style({ transform: 'scale(1)', offset: 0.28 }),
          style({ transform: 'scale(1.08)', offset: 0.42 }),
          style({ transform: 'scale(1)', offset: 0.70 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),
    
    // User glow effect
    trigger('userGlow', [
      state('default', style({ 
        boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' 
      })),
      state('glow', style({ 
        boxShadow: '0 0 20px 5px rgba(99, 102, 241, 0.3)' 
      })),
      transition('default => glow', [
        animate('1000ms ease-in-out', keyframes([
          style({ boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)', offset: 0 }),
          style({ boxShadow: '0 0 10px 2px rgba(99, 102, 241, 0.2)', offset: 0.14 }),
          style({ boxShadow: '0 0 5px 1px rgba(99, 102, 241, 0.1)', offset: 0.28 }),
          style({ boxShadow: '0 0 15px 3px rgba(99, 102, 241, 0.25)', offset: 0.42 }),
          style({ boxShadow: '0 0 20px 5px rgba(99, 102, 241, 0.3)', offset: 0.70 }),
          style({ boxShadow: '0 0 10px 2px rgba(99, 102, 241, 0.15)', offset: 1 })
        ]))
      ])
    ]),
    
    // Notification badge pulse
    trigger('notificationPulse', [
      transition(':enter', [
        animate('2000ms ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.3)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),
    
    // Number bounce in notification
    trigger('numberBounce', [
      transition(':enter', [
        style({ transform: 'scale(0) rotate(180deg)' }),
        animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ transform: 'scale(1) rotate(0deg)' })
        )
      ])
    ]),
    
    // Online status animation
    trigger('onlineStatus', [
      transition(':enter', [
        animate('1500ms ease-in-out', keyframes([
          style({ transform: 'scale(0)', opacity: 0, offset: 0 }),
          style({ transform: 'scale(1.2)', opacity: 0.8, offset: 0.6 }),
          style({ transform: 'scale(1)', opacity: 1, offset: 1 })
        ]))
      ])
    ]),
    
    // ⎋ Logout door animation
    trigger('door', [
      state('default', style({ transform: 'rotateY(0deg)', transformOrigin: 'left center' })),
      state('swing', style({ transform: 'rotateY(-90deg)', transformOrigin: 'left center' })),
      transition('default => swing', [
        animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')
      ]),
      transition('swing => default', [
        animate('300ms ease-out')
      ])
    ]),
    
    // Door frame with click effect
    trigger('doorFrame', [
      state('default', style({ borderColor: 'rgb(248 113 113)' })),
      state('open', style({ borderColor: 'rgb(239 68 68)' })),
      transition('default => open', [
        animate('100ms ease-out')
      ])
    ]),
    
    // Arrow sliding through door
    trigger('logoutArrow', [
      state('default', style({ transform: 'translateX(0px)', opacity: 1 })),
      state('slide', style({ transform: 'translateX(0px)', opacity: 1 })),
      transition('default => slide', [
        animate('800ms ease-in-out', keyframes([
          style({ transform: 'translateX(0px)', opacity: 1, offset: 0 }),
          style({ transform: 'translateX(-3px)', opacity: 0.8, offset: 0.5 }),
          style({ transform: 'translateX(8px)', opacity: 1, offset: 1 })
        ]))
      ])
    ]),
    
    // Enhanced dropdown slide animation
    trigger('dropdownSlide', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(-20px) scale(0.95) rotateX(-10deg)',
          transformOrigin: 'top right'
        }),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ 
            opacity: 1, 
            transform: 'translateY(0) scale(1) rotateX(0deg)' 
          })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ 
            opacity: 0, 
            transform: 'translateY(-20px) scale(0.95) rotateX(-10deg)' 
          })
        )
      ])
    ])
  ]
})
export class MegaMenuComponent {
  private platformId = inject(PLATFORM_ID);
  
  // Reactive signals for state management
  isMenuOpen = signal(false);
  isMobileMenuOpen = signal(false);
  activeDropdown = signal<string | null>(null);
  isMobile = signal(false);
  isUserDropdownOpen = signal(false);
  
  // Hover states for animations
  notificationHover = false;
  languageHover = false;
  darkModeHover = false;
  settingsHover = false;
  userHover = false;
  logoutHover = false;

  // Lottie animation options for professional icons
  notificationOptions = {
    path: '/assets/animations/notification-bell.json',
    loop: false,
    autoplay: false
  };

  languageOptions = {
    path: '/assets/animations/language-globe.json', 
    loop: false,
    autoplay: false
  };

  darkModeOptions = {
    path: '/assets/animations/dark-mode-toggle.json',
    loop: false,
    autoplay: false
  };

  userMenuOptions = {
    path: '/assets/animations/user-profile.json',
    loop: false,
    autoplay: false
  };

  // Lottie animation control methods
  onNotificationHover(): void {
    this.notificationHover = true;
    if (this.notificationAnimation) {
      this.notificationAnimation.play();
    }
  }

  onNotificationLeave(): void {
    this.notificationHover = false;
    if (this.notificationAnimation) {
      this.notificationAnimation.stop();
    }
  }

  onLanguageHover(): void {
    this.languageHover = true;
    if (this.languageAnimation) {
      this.languageAnimation.play();
    }
  }

  onLanguageLeave(): void {
    this.languageHover = false;
    if (this.languageAnimation) {
      this.languageAnimation.stop();
    }
  }

  onDarkModeHover(): void {
    this.darkModeHover = true;
    if (this.darkModeAnimation) {
      this.darkModeAnimation.play();
    }
  }

  onDarkModeLeave(): void {
    this.darkModeHover = false;
    if (this.darkModeAnimation) {
      this.darkModeAnimation.stop();
    }
  }

  onUserHover(): void {
    this.userHover = true;
    if (this.userAnimation) {
      this.userAnimation.play();
    }
  }

  onUserLeave(): void {
    this.userHover = false;
    if (this.userAnimation) {
      this.userAnimation.stop();
    }
  }

  // Lottie animation event handlers
  onNotificationAnimationCreated(animationItem: any): void {
    console.log('Notification animation created:', animationItem);
    if (animationItem) {
      this.notificationAnimation = animationItem;
    }
  }

  onLanguageAnimationCreated(animationItem: any): void {
    console.log('Language animation created:', animationItem);
    if (animationItem) {
      this.languageAnimation = animationItem;
    }
  }

  onDarkModeAnimationCreated(animationItem: any): void {
    console.log('Dark mode animation created:', animationItem);
    if (animationItem) {
      this.darkModeAnimation = animationItem;
    }
  }

  onUserAnimationCreated(animationItem: any): void {
    console.log('User animation created:', animationItem);
    if (animationItem) {
      this.userAnimation = animationItem;
    }
  }

  // Animation instances
  public notificationAnimation: any;
  public languageAnimation: any;
  public darkModeAnimation: any;
  public userAnimation: any;

  // Menu configuration
  menuItems: MegaMenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      description: 'Manage your business overview and analytics',
      items: [
        { title: 'Overview', description: 'Business performance metrics', route: '/dashboard/overview', icon: 'fas fa-chart-line' },
        { title: 'Analytics', description: 'Detailed data insights', route: '/dashboard/analytics', icon: 'fas fa-chart-bar' },
        { title: 'Reports', description: 'Generate comprehensive reports', route: '/dashboard/reports', icon: 'fas fa-file-alt' },
        { title: 'Real-time Data', description: 'Live business monitoring', route: '/dashboard/realtime', icon: 'fas fa-broadcast-tower', badge: 'New' },
        { title: 'KPI Tracking', description: 'Key performance indicators', route: '/dashboard/kpis', icon: 'fas fa-bullseye' },
        { title: 'Custom Views', description: 'Personalized dashboard layouts', route: '/dashboard/custom', icon: 'fas fa-th-large' },
        { title: 'Export Tools', description: 'Data export capabilities', route: '/dashboard/export', icon: 'fas fa-download' },
        { title: 'Notifications', description: 'Alert and notification center', route: '/dashboard/notifications', icon: 'fas fa-bell', badge: 'Pro' }
      ]
    },
    {
      id: 'products',
      title: 'Products',
      icon: 'fas fa-box',
      description: 'Manage your product catalog and inventory',
      items: [
        { title: 'Product Catalog', description: 'Browse all products', route: '/products', icon: 'fas fa-th-large' },
        { title: 'Inventory', description: 'Stock management', route: '/products/inventory', icon: 'fas fa-warehouse' },
        { title: 'Categories', description: 'Product categorization', route: '/products/categories', icon: 'fas fa-tags' },
        { title: 'Price Management', description: 'Pricing strategies', route: '/products/pricing', icon: 'fas fa-dollar-sign', badge: 'New' },
        { title: 'Product Reviews', description: 'Customer feedback', route: '/products/reviews', icon: 'fas fa-star' },
        { title: 'Bulk Actions', description: 'Mass product operations', route: '/products/bulk', icon: 'fas fa-list' },
        { title: 'Import/Export', description: 'Product data management', route: '/products/import-export', icon: 'fas fa-exchange-alt' },
        { title: 'Analytics', description: 'Product performance metrics', route: '/products/analytics', icon: 'fas fa-chart-pie' }
      ]
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: 'fas fa-users',
      description: 'Customer relationship management tools',
      items: [
        { title: 'Customer List', description: 'View all customers', route: '/customers', icon: 'fas fa-address-book' },
        { title: 'Customer Profiles', description: 'Detailed customer info', route: '/customers/profiles', icon: 'fas fa-user-circle' },
        { title: 'Order History', description: 'Customer purchase history', route: '/customers/orders', icon: 'fas fa-shopping-bag' },
        { title: 'Support Tickets', description: 'Customer service management', route: '/customers/support', icon: 'fas fa-headset', badge: 'Popular' },
        { title: 'Loyalty Program', description: 'Customer rewards system', route: '/customers/loyalty', icon: 'fas fa-award' },
        { title: 'Communications', description: 'Email and messaging', route: '/customers/communications', icon: 'fas fa-envelope' },
        { title: 'Segmentation', description: 'Customer group analysis', route: '/customers/segments', icon: 'fas fa-layer-group' },
        { title: 'Feedback', description: 'Customer satisfaction surveys', route: '/customers/feedback', icon: 'fas fa-comment-dots' }
      ]
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: 'fas fa-shopping-cart',
      description: 'Order management and fulfillment',
      items: [
        { title: 'Order Management', description: 'Process and track orders', route: '/orders', icon: 'fas fa-clipboard-list' },
        { title: 'Shipping', description: 'Delivery and logistics', route: '/orders/shipping', icon: 'fas fa-truck' },
        { title: 'Returns', description: 'Return request handling', route: '/orders/returns', icon: 'fas fa-undo' },
        { title: 'Payments', description: 'Payment processing', route: '/orders/payments', icon: 'fas fa-credit-card', badge: 'New' },
        { title: 'Invoices', description: 'Invoice generation', route: '/orders/invoices', icon: 'fas fa-file-invoice' },
        { title: 'Order Tracking', description: 'Real-time order status', route: '/orders/tracking', icon: 'fas fa-route' },
        { title: 'Fulfillment', description: 'Order processing workflow', route: '/orders/fulfillment', icon: 'fas fa-tasks' },
        { title: 'Reports', description: 'Order analytics and reports', route: '/orders/reports', icon: 'fas fa-chart-area' }
      ]
    }
  ];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
      window.addEventListener('resize', () => this.checkScreenSize());
      // Close dropdown when clicking outside
      window.addEventListener('click', (event) => {
        if (!event.target || !(event.target as Element).closest('.relative.group')) {
          this.isUserDropdownOpen.set(false);
        }
      });
    }
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(window.innerWidth < 1024);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
    if (this.isMobileMenuOpen()) {
      this.activeDropdown.set(null);
    }
  }

  private hoverTimeout: any = null;
  private userDropdownTimeout: any = null;

  public showDropdown(itemId: string): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.activeDropdown.set(itemId);
  }

  public hideDropdown(): void {
    this.hoverTimeout = setTimeout(() => {
      this.activeDropdown.set(null);
    }, 150);
  }

  public showUserDropdown(): void {
    if (this.userDropdownTimeout) {
      clearTimeout(this.userDropdownTimeout);
    }
    this.isUserDropdownOpen.set(true);
  }

  public hideUserDropdown(): void {
    this.userDropdownTimeout = setTimeout(() => {
      this.isUserDropdownOpen.set(false);
    }, 150);
  }

  public toggleUserDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isUserDropdownOpen.set(!this.isUserDropdownOpen());
  }

  public signOut(): void {
    // Add sign out logic here
    console.log('Signing out...');
    // Reset hover states
    this.logoutHover = false;
    // Close all dropdowns and mobile menu
    this.isUserDropdownOpen.set(false);
    this.isMobileMenuOpen.set(false);
    this.activeDropdown.set(null);
    // Redirect to login page or perform logout action
    // Example: this.router.navigate(['/login']);
  }

  toggleDropdown(itemId: string, event: Event): void {
    event.stopPropagation();
    
    if (this.isMobile()) {
      // Mobile accordion behavior
      this.activeDropdown.set(this.activeDropdown() === itemId ? null : itemId);
    } else {
      // Desktop hover behavior
      this.showDropdown(itemId);
    }
  }

  closeDropdown(): void {
    this.hideDropdown();
  }

  onMenuItemClick(): void {
    this.isMobileMenuOpen.set(false);
    this.activeDropdown.set(null);
    this.isUserDropdownOpen.set(false);
  }

  // Helper method to check if dropdown is active
  isDropdownActive(itemId: string): boolean {
    return this.activeDropdown() === itemId;
  }

  // Helper method to get main items (first 4 items) for left column
  getMainItems(items: MegaMenuSubItem[]): MegaMenuSubItem[] {
    return items.slice(0, 4);
  }

  // Helper method to get secondary items (remaining items) for right column
  getSecondaryItems(items: MegaMenuSubItem[]): MegaMenuSubItem[] {
    return items.slice(4);
  }

}