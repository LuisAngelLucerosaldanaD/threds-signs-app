import {Routes} from '@angular/router';
import {sessionTempGuard} from '../../core/guards/session-temp.guard';

export const AuthRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'recovery',
    loadComponent: () => import('./pages/recovery/recovery.component').then(m => m.RecoveryComponent)
  },
  {
    path: 'verify',
    canActivate: [sessionTempGuard],
    loadComponent: () => import('./pages/verify/verify.component').then(m => m.VerifyComponent)
  },
  {
    path: 'reset-password',
    canActivate: [sessionTempGuard],
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
