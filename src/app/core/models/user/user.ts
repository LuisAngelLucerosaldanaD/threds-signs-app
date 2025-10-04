export interface IUser {
  id: string;
  name: string;
  lastname: string;
  document: string;
  type_document: number;
  username: string;
  email: string;
  setting: IUserSettings;
  birthdate: string;
  created_at: string;
  updated_at: string;
}


export interface IUserSettings {
  sms_verified_at: string | null;
  email_verified_at: string | null;
  profile_picture: string;
  required_2fa: boolean;
}

export interface IReqUser {
  id: string;
  name: string;
  lastname: string;
  document: string;
  type_document: number;
  email: string;
  birthdate: string;
}

export interface IChangePassword {
  old_password: string;
  password: string;
}
