import {HttpInterceptorFn} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {inject} from '@angular/core';
import {CsrfTokenService} from '../security/csrf-token.service';

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const csrfService = inject(CsrfTokenService);
  const csrfToken = csrfService.getCsrfStorage();
  if (csrfToken) {
    req = req.clone({
      headers: req.headers.set('X-Csrf-Token', csrfToken),
      withCredentials: true
    });
  }

  const token = authService.getToken();
  if (token) {
    req = req.clone({
      headers: req.headers.set('Bearer', token)
    });
  }

  return next(req);
};
