import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
ngForm: any;

getData(data:NgForm) {
console.log(data.value);
}

  protected title = 'OlloLifestyle.WebApp';
  name = 'Ollo Lifestyle Web App';
  display = true;

  constructor() {
    var name= 'Ollo Lifestyle Web App';
    console.log(name);
  }
clickMe() {
    console.log('Button clicked!');
    alert('Button clicked!');
  }

}
