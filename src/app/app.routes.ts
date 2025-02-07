import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./rooms/feature/rooms-list/rooms-list.component').then(
        (m) => m.RoomsListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rooms/:id',
    loadComponent: () =>
      import('./rooms/feature/room-view/room-view.component').then(
        (m) => m.RoomViewComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/feature/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '**',
    redirectTo: ''
  }
];
