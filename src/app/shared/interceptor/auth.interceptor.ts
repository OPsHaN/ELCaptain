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

  // 🟡 شغّل spinner
  loader.show();

  // 🟢 استنساخ الطلب لو فيه token
  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(clonedReq).pipe(
    // 👇 التعامل مع أي خطأ
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    }),
    // 👇 اخفاء spinner بعد انتهاء الطلب سواء بالنجاح أو الفشل
    finalize(() => loader.hide())
  );
};
