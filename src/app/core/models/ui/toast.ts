export type TypeMessage = 'success' | 'error' | 'info' | 'warning';

export interface Message {
  type: TypeMessage;
  message: string;
  id?: any;
  key?: string;
  life?: number;
  icon?: string;
  contentStyleClass?: string;
  styleClass?: string;
}

export interface ToastCloseEvent {
  message: Message;
}
