import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatItem {
  value: string;
  label: string;
  color?: string;
}

@Component({
  selector: 'app-stats-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center lg:justify-start space-x-8">
      <div *ngFor="let stat of stats; let i = index" class="flex items-center">
        <div class="text-center">
          <div [class]="'text-2xl font-bold ' + (stat.color || 'text-white')">
            {{ stat.value }}
          </div>
          <div class="text-white/60 text-xs">{{ stat.label }}</div>
        </div>
        <div *ngIf="i < stats.length - 1" class="w-px h-8 bg-white/20 ml-8"></div>
      </div>
    </div>
  `
})
export class StatsDisplayComponent {
  @Input() stats: StatItem[] = [];
}