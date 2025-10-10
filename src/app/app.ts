import { Component } from '@angular/core';
import { Login } from "./components/login/login";
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-root',
  imports: [Login, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'elcaptain-app';
}
