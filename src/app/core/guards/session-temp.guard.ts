import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth/auth.service';

export const sessionTempGuard: CanActivateFn = (route, state) => {
  const _authService = inject(AuthService);
  const _router = inject(Router);

  const token = route.queryParams['token'];

  _authService.setTempToken(token);
  if (_authService.isTokenValid(token)) {
    _authService.setTempToken(token);
    return true;
  }

  _router.navigate(['/auth/login']);
  return false;
};
