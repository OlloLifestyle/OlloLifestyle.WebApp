import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineStatusComponent } from './shared/components/offline-status.component';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OfflineStatusComponent, NotificationComponent],
  templateUrl: './app.html'
})
export class App {
  protected title = 'OlloLifestyle.WebApp';
}
