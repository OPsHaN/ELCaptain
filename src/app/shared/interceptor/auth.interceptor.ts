import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, finalize, throwError } from "rxjs";
import { AuthService } from "../../services/authservice";
import { LoadingService } from "../../services/loadingservice";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("token");
  const router = inject(Router);
  const authService = inject(AuthService);
  const loader = inject(LoadingService);

  // ✅ استثناء login و logout من الـ interceptor
  const skipAuth = req.url.includes("login") || req.url.includes("logout");
  if (skipAuth) {
    return next(req);
  }

  loader.show();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(clonedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // 🔥 فقط لو مش طلب login/logout
        if (!skipAuth) {
          authService.logout();
        }
      }
      return throwError(() => error);
    }),
    finalize(() => loader.hide())
  );
};