import {Routes} from '@angular/router';
import {AdminComponent} from './admin.component';

export const AdminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
      }
    ]
  }
];
