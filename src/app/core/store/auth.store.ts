import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';

interface IAuth {
  token: string;
  isAuth: boolean;
  user: string;
}

type AuthState = {
  token: string;
  isAuth: boolean;
  user: string;
};

const initialState: AuthState = {
  token: '',
  isAuth: false,
  user: ''
};

export const AuthStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store) => ({
    updateSession(data: IAuth): void {
      patchState(store, (state) => ({...state, ...data}));
    },
    logout(): void {
      patchState(store, (state) => ({...state, ...initialState}));
    }
  }))
);
