import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appCan]',
  standalone: true
})
export class CanDirective {
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly authService = inject(AuthService);

  private permissions: string[] = [];

  @Input()
  set appCan(value: string | string[]) {
    this.permissions = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  private updateView() {
    this.viewContainer.clear();
    const canShow = this.permissions.some(permission => this.authService.can(permission));
    if (canShow) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
