import { Routes } from '@angular/router';

export const teamsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./team-list.component').then(m => m.TeamListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./team-create.component').then(m => m.TeamCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./team-detail.component').then(m => m.TeamDetailComponent)
  }
];
