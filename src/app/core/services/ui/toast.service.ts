import { Injectable } from '@angular/core';
import {Message} from '../../models/ui/toast';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private messageSource = new Subject<Message | Message[]>();
  private clearSource = new Subject<string | null>();

  messageObserver = this.messageSource.asObservable();
  clearObserver = this.clearSource.asObservable();

  /**
   * Método que permite agregar un item toast al listado de toast
   * @param {Message} message
   */
  public add(message: Message): void {
    if (message) this.messageSource.next(message);
  }

  /**
   * Método que permite agregar multiples items al listado del toast
   * @param messages
   */
  public addAll(messages: Message[]): void {
    if (messages && messages.length) this.messageSource.next(messages);
  }

  /**
   * Método que permite eliminar un item del listado de toast
   * @param {string} key
   */
  public clear(key?: string): void {
    this.clearSource.next(key || null);
  }
}
