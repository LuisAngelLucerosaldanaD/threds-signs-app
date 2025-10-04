import {IReqUser, IUser} from '../models/user/user';
import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';

type IUserStore = {
  user: IUser | null;
}


const initialState: IUserStore = {
  user: null
}

export const UserStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store) => ({
    setUser(user: IUser): void {
      patchState(store, (state) => ({...state, user: {...user}}));
    },
    clearUser(): void {
      patchState(store, (state) => ({...state, user: null}));
    }
  }))
);
