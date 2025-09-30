import {inject, Injectable} from '@angular/core';
import {EnvServiceFactory} from '../env/env.service.provider';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Cipher} from '../../utils/security/cipher';
import {JwtHelper} from '../../utils/jwt/jwt';
import {Observable, tap} from 'rxjs';
import {ICredentials, IOtp, IRegister, ISession} from '../../models/auth/session';
import {Response} from '../../models/response';
import {CookieService} from '../cookie/cookie.service';
import {IGeolocation} from '../../models/auth/geo';
import {AuthStore} from '../../store/auth.store';
import {RESPONSE_CODES} from '../../utils/constants/response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _url: string = EnvServiceFactory().REST_API;
  private readonly _version: string = '/api/v1';

  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _router: Router = inject(Router);
  private readonly _cipher: Cipher = new Cipher();
  private readonly _jwtHelper: JwtHelper = new JwtHelper();
  private readonly _cookieService = inject(CookieService);

  // State
  private readonly _store = inject(AuthStore);

  /**
   * Method that allow us to login
   * @param credentials - The credentials to login
   * @return Observable<Response<ISession>>
   * @example
   * private _authService = inject(AuthService);
   * const data = {
   *   email: 'joe.dow@bjungle.net'
   *   password: 'password',
   *   remember_me: true,
   *   coordinates: '0.0,0.0'
   * }
   * this._authService.login(data);
   */
  public login(credentials: ICredentials): Observable<Response<ISession>> {
    return this._http.post<Response<ISession>>(this._url + this._version + '/auth', credentials).pipe(
      tap(res => {
        this._setSession(res, credentials.remember_me);
      })
    );
  }

  /**
   * Method that allow us to login with OTP
   * @param credentials
   * @return Observable<Response<ISession>>
   * @example
   * private _authService = inject(AuthService);
   * const data = {
   *   otp: '123456',
   *   remember_me: true,
   *   coordinates: '0.0,0.0'
   * }
   * this._authService.loginWithOtp(data);
   */
  public loginWithOtp(credentials: IOtp): Observable<Response<ISession>> {
    return this._http.post<Response<ISession>>(this._url + this._version + '/auth/otp', credentials).pipe(
      tap(res => {
        this._setSession(res, credentials.remember_me);
      })
    );
  }

  /**
   * Method that allow us to register a new account
   * @return Observable<Response>
   * @example
   * private _authService = inject(AuthService);
   * const account = {
   *   name: 'Joe',
   *   lastname: 'Dow',
   *   document: '123456789',
   *   type_document: 0,
   *   username: 'joe.dow',
   *   password: 'password',
   *   email: 'joe.dow@test.com',
   *   birthdate: '1990-01-01'
   * }
   * this._authService.register(account);
   * @param account
   */
  public register(account: IRegister): Observable<Response> {
    return this._http.post<Response>(this._url + this._version + '/auth/register', account);
  }

  /**
   * Method that allow us to recover the account
   * @return Observable<Response>
   * @example
   * private _authService = inject(AuthService);
   * this._authService.recovery('joe.dow');
   * @param email
   */
  public recovery(email: string): Observable<Response> {
    return this._http.post<Response>(this._url + this._version + '/auth/recover', {email});
  }

  /**
   * Method that allow us to set the session
   * @param session
   * @param rememberMe
   * @private
   */
  private _setSession(session: Response<ISession>, rememberMe: boolean): void {
    if (session.error) {
      throw new Error(session.msg);
    }

    if (session.code !== RESPONSE_CODES.Success) return;

    this.setToken(session.data, rememberMe);
    const data = {
      token: session.data.access_token,
      isAuth: true,
      user: this.getUser(),
    };
    this._store.updateSession(data);
  }

  /**
   * Method that allow us to get the token from local or session storage
   * @return string | null
   * @example
   * private _authService = inject(AuthService);
   * const token = this._authService.getToken();
   */
  public getToken(): string | null {
    const remember = this._cookieService.get('remember_me');
    if (remember === 'true') {
      return localStorage.getItem('access_token');
    }

    return sessionStorage.getItem('access_token');
  }

  /**
   * Method that allow us to set the token in local or session storage
   * @param tokens
   * @param remember
   * @return void
   * @example
   * private _authService = inject(AuthService);
   * this._authService.setToken('token', true);
   */
  public setToken(tokens: ISession, remember: boolean): void {
    this._cookieService.set('remember_me', remember.toString());
    if (remember) {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      return;
    }

    sessionStorage.setItem('access_token', tokens.access_token);
    sessionStorage.setItem('refresh_token', tokens.refresh_token);
    return;
  }

  /**
   * Method that allow us to get current geolocation
   * @return Promise<IGeolocation>
   * @example
   * private _authService = inject(AuthService);
   * this._authService.getGeolocation().then((geo) => {
   *   console.log(geo);
   * }).catch((error) => {
   *   console.error(error);
   * });
   */
  public async getGeolocation(): Promise<IGeolocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser'));
      }

      navigator.geolocation.getCurrentPosition((position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * Method that allow us to validate if the user is authenticated
   * @return boolean
   * @example
   * private _authService = inject(AuthService);
   * const isAuth = this._authService.isAuthenticated();
   */
  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    if (!this._cipher.verifyJWT(token) || this._jwtHelper.isTokenExpired(token)) {
      return false;
    }

    return true;
  }

  /**
   * Method that allow us to get user id from token
   * @return string
   * @example
   * private _authService = inject(AuthService);
   * const userId = this._authService.getUser();
   */
  public getUser(): string {
    const token = this.getToken();
    if (!token) return '';

    const payload = this._jwtHelper.decodeToken(token);
    return payload.user.id || '';
  }
}
