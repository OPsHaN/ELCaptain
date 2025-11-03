import { ChangeDetectorRef, Component } from "@angular/core";
import { Login } from "./components/login/login";
import { Toast } from "primeng/toast";
import { NavigationEnd, Router } from "@angular/router";
import { SpinnerComponent } from "./shared/spinner/spinner.component";
import { CommonModule } from "@angular/common";
import { LoadingService } from "./services/loadingservice";
import { MessageService } from 'primeng/api';
import { GlobalNotifications } from "./shared/global-notifications/global-notifications";

@Component({
  selector: "app-root",
    standalone: true,

  imports: [Login, Toast, SpinnerComponent, CommonModule , GlobalNotifications ],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
    providers: [MessageService] // ✅ هنا مكانها الصحيح

})
export class App {
  loading = false;
  constructor(private router: Router, private cdr: ChangeDetectorRef, public loader: LoadingService) {
    // 👇 نراقب التنقل ونخزن آخر Route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        localStorage.setItem("lastRoute", event.urlAfterRedirects);
      }
    });
  }

ngOnInit() {
  const token = localStorage.getItem("token");
  const lastRoute = localStorage.getItem("lastRoute");

  if (token && lastRoute && lastRoute !== "/login") {
    this.router.navigateByUrl(lastRoute);
  } else if (!token) {
    this.router.navigate(["/login"]);
  }

  this.loader.isLoading.subscribe(() => {
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  });
}
}
