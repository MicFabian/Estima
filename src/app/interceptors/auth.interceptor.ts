import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Store } from '@ngxs/store';
import { ConfigState } from '../config/data-access/config-state/config.state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KeycloakService);
  const store = inject(Store);
  const apiUrl = store.selectSnapshot(ConfigState.keycloakUrl);
  
  // Only add the token for requests to our backend API
  if (!req.url.startsWith(apiUrl)) {
    console.log(req.url);
    const authToken = keycloak.getKeycloakInstance().token;

    if (authToken) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });
      return next(authReq);
    }
  }
  
  return next(req);
};
