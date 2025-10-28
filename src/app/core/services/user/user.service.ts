import {inject, Injectable} from '@angular/core';
import {EnvServiceFactory} from '../env/env.service.provider';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {IReqUser, IUpdatePhoto, IUser, IUserSettings} from '../../models/user/user';
import {IResponse} from '../../models/IResponse';
import {db, DbService} from '../db/db.service';
import {UserStore} from '../../store/user.store';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly _url: string = EnvServiceFactory().REST_API;
  private readonly _version: string = '/api/v1';
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _userStore = inject(UserStore);

  /**
   * Get user profile by user ID
   * @return Observable<IResponse<IUser>>
   * @example
   * private _userService = inject(UserService);
   * this._userService.getUserProfile('userId').subscribe();
   * @param userId
   */
  public getUserProfile(userId: string): Observable<IResponse<IUser>> {
    return this._http.get<IResponse<IUser>>(`${this._url}${this._version}/user/${userId}`).pipe(
      tap(res => {
        if (!res.error) {
          const data = res.data;
          db.userTable.add(DbService.parseUser(data));
        }
      }),
    );
  }

  /**
   * Update user profile
   * @return Observable<IResponse>
   * @example
   * private _userService = inject(UserService);
   * const user: IReqUser = {id: '1', name: 'John', lastname: 'Doe', document: '123456', type_document: 1, email: 'john.doe@test.com', birthdate: '1990-01-01'};
   * this._userService.updateUserProfile(user).subscribe();
   * @param user
   */
  public updateUserProfile(user: IReqUser): Observable<IResponse> {
    return this._http.put<IResponse>(this._url + this._version + '/user', user).pipe(tap(res => {
      if (!res.error) {
        const data: IUser = {
          id: this._userStore.user()?.id || '',
          name: user.name,
          lastname: user.lastname,
          document: this._userStore.user()?.document || '',
          type_document: this._userStore.user()?.type_document || 0,
          username: this._userStore.user()?.username || '',
          email: user.email,
          setting: this._userStore.user()?.setting as IUserSettings,
          birthdate: this._userStore.user()?.birthdate || '',
          created_at: this._userStore.user()?.created_at || '',
          updated_at: this._userStore.user()?.updated_at || '',
        };

        this._userStore.setUser(data);
        db.userTable.put(DbService.parseUser(data));
      }
    }));
  }

  /**
   * Update profile picture
   * @return Observable<IResponse>
   * @example
   * private _userService = inject(UserService);
   * const data: IUpdatePhoto = {photo: 'base64string'};
   * this._userService.updateProfilePicture(data).subscribe();
   * @param data
   */
  public updateProfilePicture(data: IUpdatePhoto): Observable<IResponse> {
    return this._http.put<IResponse>(this._url + this._version + '/user/photo', data).pipe(tap(res => {
      if (!res.error) {
        const user = this._userStore.user();
        if (user) {
          const updatedUser: IUser = {
            ...user,
            setting: {
              ...user.setting,
              profile_picture: data.picture
            }
          };
          this._userStore.setUser(updatedUser);
          db.userTable.put(DbService.parseUser(updatedUser));
        }
      }
    }));
  }

}
