import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes, query, stagger } from '@angular/animations';

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
  imports: [CommonModule, RouterModule],
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
    
    // Bell shake animation
    trigger('bellShake', [
      state('default', style({ transform: 'rotate(0deg)' })),
      state('shake', style({ transform: 'rotate(0deg)' })),
      transition('default => shake', [
        animate('600ms ease-in-out', keyframes([
          style({ transform: 'rotate(0deg)', offset: 0 }),
          style({ transform: 'rotate(-15deg)', offset: 0.25 }),
          style({ transform: 'rotate(15deg)', offset: 0.5 }),
          style({ transform: 'rotate(-10deg)', offset: 0.75 }),
          style({ transform: 'rotate(0deg)', offset: 1 })
        ]))
      ])
    ]),
    
    // Globe rotation
    trigger('globeRotate', [
      state('default', style({ transform: 'rotateY(0deg)' })),
      state('rotate', style({ transform: 'rotateY(0deg)' })),
      transition('default => rotate', [
        animate('1200ms ease-in-out', keyframes([
          style({ transform: 'rotateY(0deg)', offset: 0 }),
          style({ transform: 'rotateY(180deg)', offset: 0.5 }),
          style({ transform: 'rotateY(360deg)', offset: 1 })
        ]))
      ])
    ]),
    
    // Moon phase animation
    trigger('moonPhase', [
      state('default', style({ transform: 'rotate(0deg) scale(1)' })),
      state('phase', style({ transform: 'rotate(0deg) scale(1)' })),
      transition('default => phase', [
        animate('800ms ease-in-out', keyframes([
          style({ transform: 'rotate(0deg) scale(1)', offset: 0 }),
          style({ transform: 'rotate(90deg) scale(0.8)', offset: 0.25 }),
          style({ transform: 'rotate(180deg) scale(1.1)', offset: 0.5 }),
          style({ transform: 'rotate(270deg) scale(0.9)', offset: 0.75 }),
          style({ transform: 'rotate(360deg) scale(1)', offset: 1 })
        ]))
      ])
    ]),
    
    // User pulse animation
    trigger('userPulse', [
      state('default', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1)' })),
      transition('default => pulse', [
        animate('1000ms ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.3 }),
          style({ transform: 'scale(0.95)', offset: 0.6 }),
          style({ transform: 'scale(1.05)', offset: 0.8 }),
          style({ transform: 'scale(1)', offset: 1 })
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
    
    // Dropdown slide animation
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
  userHover = false;

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