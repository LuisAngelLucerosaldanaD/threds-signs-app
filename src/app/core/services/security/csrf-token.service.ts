import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EnvServiceFactory} from '../env/env.service.provider';
import {interval, Observable, switchMap, tap} from 'rxjs';
import {CsrfTokenResponse} from '../../models/auth/security';

@Injectable({
  providedIn: 'root'
})
export class CsrfTokenService {
  private readonly _url: string = EnvServiceFactory().REST_API + '/csrf-token';

  private _http = inject(HttpClient);

  public initializeCsrfToken(): void {
    this._getCsrfToken().subscribe();

    interval(25 * 60 * 1000)
      .pipe(switchMap(() => this._getCsrfToken()))
      .subscribe();
  }

  /**
   * Method that allow us to get csrf token
   * @return Observable<any>
   */
  public _getCsrfToken(): Observable<CsrfTokenResponse> {
    return this._http.get<CsrfTokenResponse>(this._url, {withCredentials: true}).pipe(
      tap((res) => {
        if (res.csrf_token) sessionStorage.setItem('csrf_token', res.csrf_token);
      })
    );
  }

  /**
   * Method that allow us to get csrf token from session storage
   * @return string | null
   * @example
   * private _authService = inject(AuthService);
   * const csrfToken = this._authService.getCsrfStorage();
   */
  public getCsrfStorage(): string | null {
    return sessionStorage.getItem('csrf_token');
  }

}
