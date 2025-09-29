import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.AuthRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.routes').then((m) => m.AdminRoutes),
  },
  {
    path: '**',
    redirectTo: 'auth',
    pathMatch: 'full',
  }
];
