import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {inject} from '@angular/core';
import {CsrfTokenService} from '../security/csrf-token.service';
import {catchError, switchMap, throwError} from 'rxjs';

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
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    });
  }

  const tokenTemp = authService.getTempToken();
  if (tokenTemp) {
    req = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + tokenTemp)
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        return csrfService.getCsrfToken().pipe(
          switchMap(res => {
            if (res.csrf_token) sessionStorage.setItem('csrf_token', res.csrf_token);
            const newReq = req.clone({
              headers: req.headers.set('X-Csrf-Token', res.csrf_token)
            });
            return next(newReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
