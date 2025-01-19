import { Routes } from '@angular/router';
import { AuthGuard } from './auth/data-access/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/feature/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'votes',
    loadComponent: () => import('./votes/feature/vote-creation/vote-creation.component').then(m => m.VoteCreationComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
