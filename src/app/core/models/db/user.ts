export interface IUserDB {
  id: string;
  name: string;
  lastname: string;
  document: string;
  type_document: number;
  username: string;
  email: string;
  setting: {
    sms_verified_at: string | null;
    email_verified_at: string | null;
    profile_picture: string;
    required_2fa: boolean;
  };
  birthdate: string;
  created_at: string;
  updated_at: string;
}
