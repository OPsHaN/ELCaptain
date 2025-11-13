import { inject, Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { finalize } from "rxjs";
import { LoadingService } from "../../services/loadingservice";


export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const loadingService = inject(LoadingService);

  // ✅ لو الهيدر موجود، تجاهل الـ spinner
  if (req.headers.has('ignore-spinner')) {
    const cleanReq = req.clone({
      headers: req.headers.delete('ignore-spinner'),
    });
    return next(cleanReq);
  }

  // 🔥 في الحالات العادية: أظهر الـ spinner
  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};


