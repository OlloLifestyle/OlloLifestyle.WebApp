import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ParticleConfig {
  count?: number;
  size?: string;
  opacity?: string;
  animationDuration?: string;
  colors?: string[];
}

@Component({
  selector: 'app-animated-particles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute inset-0 pointer-events-none" [class.overflow-hidden]="containParticles">
      <div 
        *ngFor="let particle of particles; let i = index"
        class="absolute rounded-full animate-particle-drift"
        [style.width]="config.size || '4px'"
        [style.height]="config.size || '4px'"
        [style.left]="particle.left"
        [style.top]="particle.top"
        [style.background-color]="particle.color"
        [style.opacity]="config.opacity || '0.2'"
        [style.animation-delay]="particle.delay"
        [style.animation-duration]="particle.duration">
      </div>
    </div>
  `,
  styles: [`
    @keyframes particle-drift {
      0% { 
        transform: translateY(0px) translateX(0px) rotate(0deg);
        opacity: 1;
      }
      25% { 
        transform: translateY(-20px) translateX(10px) rotate(90deg);
        opacity: 0.8;
      }
      50% { 
        transform: translateY(-40px) translateX(-5px) rotate(180deg);
        opacity: 0.6;
      }
      75% { 
        transform: translateY(-60px) translateX(15px) rotate(270deg);
        opacity: 0.4;
      }
      100% { 
        transform: translateY(-80px) translateX(0px) rotate(360deg);
        opacity: 0;
      }
    }

    .animate-particle-drift {
      animation: particle-drift linear infinite;
    }
  `]
})
export class AnimatedParticlesComponent {
  @Input() config: ParticleConfig = {};
  @Input() containParticles: boolean = true;

  particles: Array<{
    left: string;
    top: string;
    color: string;
    delay: string;
    duration: string;
  }> = [];

  ngOnInit() {
    this.generateParticles();
  }

  private generateParticles(): void {
    const count = this.config.count || 8;
    const colors = this.config.colors || ['rgba(255, 255, 255, 0.4)'];
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: `${i * 0.5}s`,
        duration: `${3 + Math.random() * 3}s`
      });
    }
  }
}