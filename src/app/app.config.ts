import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { en_US, provideNzI18n} from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/Interceptor/auth.interceptor';
import { AuthService } from './auth/auth.service';
import { errorInterceptor } from './core/Interceptor/ErrorInterceptor.interceptor';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()), 
    provideNzI18n(en_US), 
    importProvidersFrom(FormsModule), 
    provideAnimationsAsync(), 
    provideHttpClient(withFetch() ,withInterceptors([authInterceptor, errorInterceptor])),
    NzMessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => {
        return () => authService.loadUserFromStorage(); // load user từ localStorage
      },
      deps: [AuthService],
      multi: true,
    },
  ]
};
