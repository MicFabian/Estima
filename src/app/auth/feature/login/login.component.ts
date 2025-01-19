import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true
})
export class  LoginComponent implements OnInit {
  loading = true; // To show a loading indicator

  error = false;  // To display errors if login fails

  private router = inject(Router);

  private keycloakService = inject(KeycloakService);

  async ngOnInit(): Promise<void> {
    try {
      console.log('Initializing login process...');

      // Check if the user is already authenticated
      const isAuthenticated = await this.keycloakService.isLoggedIn();

      if (isAuthenticated) {
        console.log('User is already authenticated. Redirecting to dashboard...');
        await this.router.navigate(['/dashboard']);
      } else {
        console.log('User not authenticated. Triggering login...');
        await this.keycloakService.login({
          redirectUri: window.location.origin + '/dashboard'
        });
      }
    } catch (err) {
      console.error('Error during Keycloak login process:', err);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }
}
