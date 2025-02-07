import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add the /api prefix if it's not already there
  if (!req.url.includes('/api/') && req.url.includes(environment.apiUrl)) {
    const apiReq = req.clone({
      url: req.url.replace(environment.apiUrl, `${environment.apiUrl}/api`)
    });
    return next(apiReq);
  }
  return next(req);
};
