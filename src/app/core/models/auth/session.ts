export interface ICredentials {
  username: string;
  password: string;
  remember_me: boolean;
  coordinates: string;
}

export interface IOtp {
  otp: string;
  coordinates: string;
  remember_me: boolean;
}

export interface ISession {
  access_token: string;
  refresh_token: string;
}

export interface IRegister {
  name: string;
  lastname: string;
  document: string;
  type_document: number;
  username: string;
  password: string;
  email: string;
  birthdate: string;
}
