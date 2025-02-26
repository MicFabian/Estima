import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true
})
export class LoginComponent implements OnInit {
  loading = true;
  error = false;

  private router = inject(Router);
  private keycloakService = inject(KeycloakService);

  async ngOnInit(): Promise<void> {
    try {
      console.log('Initializing login process...');
      const isAuthenticated = await this.keycloakService.isLoggedIn();

      if (isAuthenticated) {
        console.log('User is already authenticated. Redirecting to rooms...');
        await this.router.navigate(['/']);
      }
    } catch (err) {
      console.error('Error during Keycloak initialization:', err);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  async login(): Promise<void> {
    try {
      this.loading = true;
      this.error = false;
      await this.keycloakService.login({
        redirectUri: window.location.origin
      });
    } catch (err) {
      console.error('Error during Keycloak login:', err);
      this.error = true;
      this.loading = false;
    }
  }
}
