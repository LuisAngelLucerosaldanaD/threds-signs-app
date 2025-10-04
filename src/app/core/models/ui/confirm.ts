import {EventEmitter} from '@angular/core';

export interface Confirmation {
  message: string;
  key: string;
  icon?: string;
  header: string;
  accept?: Function;
  reject?: Function;
  acceptEvent?: EventEmitter<any>;
  rejectEvent?: EventEmitter<any>;
}
