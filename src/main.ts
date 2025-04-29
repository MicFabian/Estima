import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideStore, provideStates, Store } from '@ngxs/store';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAppInitializer, inject, importProvidersFrom } from '@angular/core';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { MatChipsModule } from '@angular/material/chips';
import { ConfigState, SetConfig } from './app/config/data-access/config-state/config.state';
import { VotesState } from './app/votes/data-access/votes-state/votes.state';
import { firstValueFrom } from 'rxjs';
import { authInterceptor } from './app/interceptors/auth.interceptor';

function initializeKeycloakAndConfig(): Promise<void> {
  const store = inject(Store);
  const keycloak = inject(KeycloakService);

  return firstValueFrom(store.dispatch(SetConfig)).then(() => {
    const keycloakUrl = store.selectSnapshot(ConfigState.keycloakUrl);
    const realm = store.selectSnapshot(ConfigState.realm);
    const clientId = store.selectSnapshot(ConfigState.clientId);

    console.log(`Keycloak URL: ${ keycloakUrl }`);
    console.log(`Realm: ${ realm }`);
    console.log(`Client ID: ${ clientId }`);

    return keycloak
      .init({
        config: {
          url: keycloakUrl,
          realm: realm,
          clientId: clientId
        },
        initOptions: {
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false
        }
      })
      .then((authenticated) => {
        if (!authenticated) {
          console.warn('User is not authenticated. Redirecting to login...');
          return keycloak.login();
        }
        console.log('Keycloak initialized successfully, user authenticated.');
        return Promise.resolve(); // Explicitly resolve the Promise<void>
      })
      .catch((error) => {
        console.error('Keycloak initialization failed:', error);
        return Promise.reject(error); // Ensure consistent Promise<void> return
      });
  });
}

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    provideStore(
      [],
      withNgxsStoragePlugin({
        keys: '*'
      })
    ),
    provideStates([
      ConfigState,
      VotesState
    ]),
    // Provide Keycloak and Angular Material Chips configuration
    importProvidersFrom(KeycloakAngularModule, MatChipsModule),

    // Initialize Keycloak and Config before the app runs
    provideAppInitializer(initializeKeycloakAndConfig),
    provideHttpClient(withInterceptors([authInterceptor]))

  ]
}).catch(err => console.error(err));