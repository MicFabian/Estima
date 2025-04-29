import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/teams' // Redirect to teams overview on entry
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
    path: 'rooms/:roomId/voting/:storyId',
    loadComponent: () =>
      import('./rooms/feature/voting/voting.component').then(
        (m) => m.VotingComponent
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
    path: 'teams',
    canActivate: [authGuard],
    loadChildren: () => import('./teams/feature/teams.routes').then(m => m.teamsRoutes) // Corrected export name
  },
  {
    path: '**',
    redirectTo: ''
  }
];
