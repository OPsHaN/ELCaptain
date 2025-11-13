import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem("token");
    const isPublicPage = state.url === "/" || state.url === "/login";

    // ✅ Landing و Login صفحات عامة
    if (isPublicPage) {
      return true;
    }

    if (token) {
      return true;
    }

    this.router.navigate(["/login"]);
    return false;
  }
}
