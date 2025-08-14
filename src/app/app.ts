import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from "./auth/login/login";
import { OfflineStatusComponent } from './components/offline-status/offline-status.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OfflineStatusComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'OlloLifestyle.WebApp';
}
