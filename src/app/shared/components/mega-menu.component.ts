import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
    trigger('megaMenuAnimation', [
      state('closed', style({
        opacity: 0,
        transform: 'translateY(-10px)',
        visibility: 'hidden'
      })),
      state('open', style({
        opacity: 1,
        transform: 'translateY(0)',
        visibility: 'visible'
      })),
      transition('closed => open', [
        animate('200ms ease-out')
      ]),
      transition('open => closed', [
        animate('150ms ease-in')
      ])
    ]),
    trigger('mobileMenuAnimation', [
      state('closed', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('open', style({
        height: '*',
        opacity: 1,
        overflow: 'visible'
      })),
      transition('closed => open', [
        animate('300ms ease-out')
      ]),
      transition('open => closed', [
        animate('200ms ease-in')
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