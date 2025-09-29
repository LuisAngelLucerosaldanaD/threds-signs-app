export interface Response<T = any> {
  error: boolean;
  msg: string;
  code: number;
  data: T;
}
