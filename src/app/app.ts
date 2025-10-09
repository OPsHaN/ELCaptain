import { Component } from '@angular/core';
import { Login } from "./components/login/login";

@Component({
  selector: 'app-root',
  imports: [ Login],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'elcaptain-app';
}
