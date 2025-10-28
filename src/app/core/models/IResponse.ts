export interface IResponse<T = any> {
  error: boolean;
  msg: string;
  code: number;
  data: T;
}
