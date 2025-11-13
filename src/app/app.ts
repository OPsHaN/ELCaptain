import { ChangeDetectorRef, Component } from "@angular/core";
import { Login } from "./components/login/login";
import { Toast } from "primeng/toast";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { SpinnerComponent } from "./shared/spinner/spinner.component";
import { CommonModule } from "@angular/common";
import { LoadingService } from "./services/loadingservice";
import { MessageService } from 'primeng/api';
import { GlobalNotifications } from "./shared/global-notifications/global-notifications";

@Component({
  selector: "app-root",
    standalone: true,

  imports: [Login, Toast, SpinnerComponent, CommonModule, GlobalNotifications, RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
    providers: [MessageService] // ✅ هنا مكانها الصحيح

})
export class App {
  loading = false;
  constructor(private router: Router, private cdr: ChangeDetectorRef, public loader: LoadingService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        localStorage.setItem("lastRoute", event.urlAfterRedirects);
      }
    });
  }

ngOnInit() {
  const token = localStorage.getItem("token");
  const lastRoute = localStorage.getItem("lastRoute");
  const allowedWithoutToken = ['/', '/login'];

  if (token && lastRoute && !allowedWithoutToken.includes(lastRoute)) {
    this.router.navigateByUrl(lastRoute);
  }
}

isLoggedIn() {
  return !!localStorage.getItem('token');
}

}
