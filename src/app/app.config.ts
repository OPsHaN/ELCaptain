import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  importProvidersFrom,
  inject,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { provideAnimations } from "@angular/platform-browser/animations";
import { providePrimeNG } from "primeng/config";
import Lara from "@primeng/themes/lara";
import { provideHttpClient, withInterceptors } from "@angular/common/http";

import { routes } from "./app.routes";
import { authInterceptor } from "./shared/interceptor/auth.interceptor";
import { LoadingService } from "./services/loadingservice";
import { loadingInterceptor } from "./shared/interceptor/loading.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    providePrimeNG({
      theme: { preset: Lara },
    }),

    // 🟢 HTTP client مع auth + spinner + 401 handling
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor])
    ),    

    provideRouter(routes),
    importProvidersFrom(ToastModule),
    MessageService,
  ],
};
