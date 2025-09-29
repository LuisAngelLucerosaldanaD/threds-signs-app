export interface Message {
  type: string;
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
