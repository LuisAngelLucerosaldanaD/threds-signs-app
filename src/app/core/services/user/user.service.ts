import {inject, Injectable} from '@angular/core';
import {EnvServiceFactory} from '../env/env.service.provider';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {IUser} from '../../models/user/user';
import {Response} from '../../models/response';
import {db} from '../db/db.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly _url: string = EnvServiceFactory().REST_API;
  private readonly _version: string = '/api/v1';
  private readonly _http: HttpClient = inject(HttpClient);

  /**
   * Get user profile by user ID
   * @return Observable<Response<IUser>>
   * @example
   * private _userService = inject(UserService);
   * this._userService.getUserProfile('userId').subscribe();
   * @param userId
   */
  public getUserProfile(userId: string): Observable<Response<IUser>> {
    return this._http.get<Response<IUser>>(`${this._url}${this._version}/user/${userId}`).pipe(
      tap(res => {
        if (!res.error) {
          const data = res.data;
          db.userTable.add({
            id: data.id,
            name: data.name,
            lastname: data.lastname,
            document: data.document,
            type_document: data.type_document,
            username: data.username,
            email: data.email,
            setting: {
              sms_verified_at: data.setting.sms_verified_at,
              email_verified_at: data.setting.email_verified_at,
              profile_picture: data.setting.profile_picture,
              required_2fa: data.setting.required_2fa
            },
            birthdate: data.birthdate,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      }),
    );
  }
}
