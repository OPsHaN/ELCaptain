import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  importProvidersFrom,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { provideAnimations } from "@angular/platform-browser/animations";
import { providePrimeNG } from "primeng/config";
import Lara from "@primeng/themes/lara"; // أضف هذا الاستيراد للثيم (Lara Light Blue)

import { routes } from "./app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "./shared/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Lara, // يمكنك تغييره إلى LaraDark أو Aura أو أي ثيم آخر
      },
    }),
    provideHttpClient(withInterceptors([authInterceptor])),

    provideRouter(routes),
    importProvidersFrom(ToastModule),
    MessageService,
  ],
};
