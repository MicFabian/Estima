import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/data-access/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RxStompService } from '@stomp/ng2-stompjs';
import { rxStompServiceFactory } from './core/websocket/rx-stomp-service-factory';
import { apiInterceptor } from './core/interceptors/api.interceptor.factory';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, apiInterceptor])),
    provideAnimations(),
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory
    }
  ]
};
