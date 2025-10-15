import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from '../../services/loadingservice';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.loadingService.show(); // 👈 عند بداية أي طلب

    return next.handle(req).pipe(
      finalize(() => {
        this.loadingService.hide(); // 👈 لما الطلب يخلص
      })
    );
  }
}
