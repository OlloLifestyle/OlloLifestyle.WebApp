import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface MegaMenuItem {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  items: MegaMenuSubItem[];
}

interface MegaMenuSubItem {
  title: string;
  description?: string;
  route: string;
  icon?: string;
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
      id: 'explore',
      title: 'Explore',
      description: 'Discover design components and resources',
      items: [
        { title: 'Components', description: 'UI building blocks', route: '/components', icon: '🧩' },
        { title: 'Wireframes', description: 'Layout structures', route: '/wireframes', icon: '📐' },
        { title: 'UI Elements', description: 'Interface components', route: '/ui-elements', icon: '🎨' },
        { title: 'Boosters', description: 'Advanced solutions', route: '/boosters', icon: '🚀' },
        { title: 'Illustrations', description: 'Vector graphics', route: '/illustrations', icon: '🎭' },
        { title: 'Icons', description: 'Icon library', route: '/icons', icon: '⭐' },
        { title: 'Templates', description: 'Ready-made layouts', route: '/templates', icon: '📄' },
        { title: 'Pro Access', description: 'Premium resources', route: '/pro', icon: '👑', badge: 'Pro' }
      ]
    },
    {
      id: 'product',
      title: 'Product',
      description: 'Learn about our features and capabilities',
      items: [
        { title: 'Browse Products', description: 'Explore our catalog', route: '/products', icon: '🔍' },
        { title: 'Get Started', description: 'Begin your journey', route: '/get-started', icon: '🚀' },
        { title: 'Apps & Tools', description: 'Extensions and plugins', route: '/apps', icon: '🛠️' },
        { title: 'Framer', description: 'Framer integration', route: '/framer', icon: '📱', badge: 'New' },
        { title: 'Webflow', description: 'Webflow resources', route: '/webflow', icon: '🌐' },
        { title: 'Figma', description: 'Figma components', route: '/figma', icon: '🎨' },
        { title: 'Components', description: 'Reusable elements', route: '/components', icon: '🧩' },
        { title: 'Wireframes', description: 'Structure layouts', route: '/wireframes', icon: '📐' }
      ]
    },
    {
      id: 'resources',
      title: 'Resources',
      description: 'Documentation, guides, and support materials',
      items: [
        { title: 'Documentation', description: 'Complete guides', route: '/docs', icon: '📖' },
        { title: 'Tutorials', description: 'Step-by-step guides', route: '/tutorials', icon: '🎓' },
        { title: 'Blog', description: 'Latest updates', route: '/blog', icon: '✍️' },
        { title: 'Community', description: 'Join discussions', route: '/community', icon: '👥' },
        { title: 'Support', description: 'Get help', route: '/support', icon: '🆘' },
        { title: 'Changelog', description: 'Recent updates', route: '/changelog', icon: '📋', badge: 'Updated' },
        { title: 'API Reference', description: 'Developer docs', route: '/api', icon: '⚡' },
        { title: 'Best Practices', description: 'Design guidelines', route: '/best-practices', icon: '⭐' }
      ]
    },
    {
      id: 'pricing',
      title: 'Pricing',
      description: 'Choose the perfect plan for your needs',
      items: [
        { title: 'Free Plan', description: 'Get started for free', route: '/pricing/free', icon: '🆓' },
        { title: 'Pro Plan', description: 'Advanced features', route: '/pricing/pro', icon: '👑', badge: 'Popular' },
        { title: 'Team Plan', description: 'Collaborate with team', route: '/pricing/team', icon: '👥' },
        { title: 'Enterprise', description: 'Custom solutions', route: '/pricing/enterprise', icon: '🏢' },
        { title: 'Compare Plans', description: 'Feature comparison', route: '/pricing/compare', icon: '⚖️' },
        { title: 'Chrome Extension', description: 'Browser integration', route: '/chrome-extension', icon: '🌐' },
        { title: 'Figma Plugin', description: 'Design tool plugin', route: '/figma-plugin', icon: '🎨' },
        { title: 'Boosters', description: 'No-code solutions', route: '/boosters', icon: '🚀' }
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
      this.isMobile.set(window.innerWidth < 768);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
    if (this.isMobileMenuOpen()) {
      this.activeDropdown.set(null);
    }
  }

  toggleDropdown(itemId: string, event: Event): void {
    event.stopPropagation();
    
    if (this.isMobile()) {
      // Mobile accordion behavior
      this.activeDropdown.set(this.activeDropdown() === itemId ? null : itemId);
    } else {
      // Desktop hover behavior
      this.activeDropdown.set(itemId);
    }
  }

  closeDropdown(): void {
    setTimeout(() => {
      this.activeDropdown.set(null);
    }, 150);
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