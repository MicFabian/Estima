import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only add the /api prefix if it's not already there
    if (!request.url.includes('/api/') && request.url.includes(environment.apiUrl)) {
      const apiRequest = request.clone({
        url: request.url.replace(environment.apiUrl, `${environment.apiUrl}/api`)
      });
      return next.handle(apiRequest);
    }
    return next.handle(request);
  }
}
