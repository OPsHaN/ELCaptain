/// <reference types="@angular/localize" />

import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./app/app";
import { provideHttpClient } from "@angular/common/http";
import { appConfig as importedAppConfig } from "./app/app.config";


bootstrapApplication(App, {
  ...importedAppConfig,
  providers: [
    ...importedAppConfig.providers,
    provideHttpClient(),
  ],
})
.catch((err) => console.error(err));
