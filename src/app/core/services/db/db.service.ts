import Dexie, {Table} from 'dexie';
import {IUserDB} from '../../models/db/user';
import {IUser} from '../../models/user/user';

export class DbService extends Dexie {
  userTable!: Table<IUserDB, number>;

  constructor() {
    super('ngdexieliveQuery');
    this.version(1).stores({
      userTable: '++id',
    });
  }

  static parseUser(user: IUser): IUserDB {
    return {
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      document: user.document,
      type_document: user.type_document,
      username: user.username,
      email: user.email,
      setting: {
        sms_verified_at: user.setting.sms_verified_at,
        email_verified_at: user.setting.email_verified_at,
        profile_picture: user.setting.profile_picture,
        required_2fa: user.setting.required_2fa
      },
      birthdate: user.birthdate,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
}

export const db = new DbService();
