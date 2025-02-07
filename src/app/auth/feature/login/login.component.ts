import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Estima
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          @if (error) {
            <div class="rounded-md bg-red-50 p-4 mb-4">
              <div class="flex">
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">
                    Login failed. Please try again.
                  </h3>
                </div>
              </div>
            </div>
          }
          
          @if (loading) {
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          } @else {
            <button
              (click)="login()"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in with Keycloak
            </button>
          }
        </div>
      </div>
    </div>
  `,
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
