import Dexie, {Table} from 'dexie';
import {IUserDB} from '../../models/db/user';

export class DbService extends Dexie {
  userTable!: Table<IUserDB, number>;

  constructor() {
    super('ngdexieliveQuery');
    this.version(1).stores({
      userTable: '++id',
    });
  }
}

export const db = new DbService();
