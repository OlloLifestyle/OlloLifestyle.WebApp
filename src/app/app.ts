import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineStatusComponent } from './shared/components/offline-status.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OfflineStatusComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'OlloLifestyle.WebApp';
}
