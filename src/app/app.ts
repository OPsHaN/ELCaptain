import { Component } from '@angular/core';
import { Login } from "./components/login/login";
import { Toast } from "primeng/toast";
import { Loading } from "./shared/loading/loading";
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Login, Toast, Loading],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'elcaptain-app';
  constructor(private router: Router) {
    // 👇 نراقب التنقل ونخزن آخر Route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        localStorage.setItem('lastRoute', event.urlAfterRedirects);
      }
    });
  }

ngOnInit() {
  const token = localStorage.getItem('token');
  const lastRoute = localStorage.getItem('lastRoute');

  // ✅ لو المستخدم داخل (فيه token)
  if (token && lastRoute && lastRoute !== '/login') {
    this.router.navigateByUrl(lastRoute);
  }
  // ❌ لو مفيش token
  else if (!token) {
    this.router.navigate(['/login']);
  }
}

}



