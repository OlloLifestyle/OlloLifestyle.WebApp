import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface ProductSection {
  title: string;
  items: {
    name: string;
    icon: string;
    description?: string;
    href: string;
  }[];
}

@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideDown', [
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
        style({ visibility: 'visible' }),
        animate('200ms ease-out')
      ]),
      transition('open => closed', [
        animate('150ms ease-in'),
        style({ visibility: 'hidden' })
      ])
    ]),
    trigger('slideInMobile', [
      state('closed', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      state('open', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('closed => open', animate('300ms ease-out')),
      transition('open => closed', animate('250ms ease-in'))
    ])
  ],
  templateUrl: './mega-menu.component.html',
  styleUrls: ['./mega-menu.component.css']
})
export class MegaMenuComponent {
  showProductDropdown = signal(false);
  mobileMenuOpen = signal(false);
  mobileProductOpen = signal(false);

  productSections: ProductSection[] = [
    {
      title: 'Browse Products',
      items: [
        { name: 'Components', icon: 'fas fa-puzzle-piece', href: '#' },
        { name: 'Wireframes', icon: 'fas fa-project-diagram', href: '#' },
        { name: 'UI Elements', icon: 'fas fa-palette', href: '#' },
        { name: 'Boosters', icon: 'fas fa-rocket', href: '#' },
        { name: 'Freebies', icon: 'fas fa-gift', href: '#' }
      ]
    },
    {
      title: 'Apps & Tools',
      items: [
        { 
          name: 'Chrome Extension', 
          icon: 'fab fa-chrome', 
          description: 'Design faster with our browser extension',
          href: '#' 
        },
        { 
          name: 'Figma Plugin', 
          icon: 'fab fa-figma', 
          description: 'Seamless Figma integration for designers',
          href: '#' 
        },
        { 
          name: 'Boosters', 
          icon: 'fas fa-bolt', 
          description: 'Supercharge your workflow',
          href: '#' 
        }
      ]
    }
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen.update(isOpen => !isOpen);
    if (!this.mobileMenuOpen()) {
      this.mobileProductOpen.set(false);
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
    this.mobileProductOpen.set(false);
  }

  toggleMobileProduct() {
    this.mobileProductOpen.update(isOpen => !isOpen);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close mobile menu if clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('nav') && this.mobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeMobileMenu();
    this.showProductDropdown.set(false);
  }
}