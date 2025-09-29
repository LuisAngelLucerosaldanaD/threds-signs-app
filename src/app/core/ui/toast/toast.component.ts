import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, output} from '@angular/core';
import {Subscription} from 'rxjs';
import {ToastPosition} from '../../types/toast';
import {ToastItemComponent} from '../toast-item/toast-item.component';
import {Message, ToastCloseEvent} from '../../models/ui/toast';
import {ToastService} from '../../services/ui/toast.service';
import {animateChild, query, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-toast',
  imports: [
    ToastItemComponent
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [trigger('toastAnimation', [transition(':enter, :leave', [query('@*', animateChild())])])],
})
export class ToastComponent {

  preventDuplicates = input(false);
  preventOpenDuplicates = input(false);
  key = input<string>();
  position = input<ToastPosition>('top-right');
  showTransformOptions = input<string>('translateY(100%)');
  hideTransformOptions = input<string>('translateY(-100%)');
  showTransitionOptions = input<string>('300ms ease-out');
  hideTransitionOptions = input<string>('250ms ease-in');

  onClose = output<ToastCloseEvent>();

  private readonly messageService = inject(ToastService);
  private readonly cd = inject(ChangeDetectorRef);
  private messageSubscription: Subscription | undefined;
  private clearSubscription: Subscription | undefined;
  private messagesArchive: Message[] | undefined;
  public messages: Message[] = [];

  constructor() {
    this.messageSubscription = this.messageService.messageObserver.subscribe((messages) => {
      if (messages) {
        if (Array.isArray(messages)) {
          const filteredMessages = messages.filter((m) => this.canAdd(m));
          this.add(filteredMessages);
          return;
        }

        if (this.canAdd(messages)) this.add([messages]);
      }
    });

    this.clearSubscription = this.messageService.clearObserver.subscribe((key) => {
      if (!key) {
        this.messages = [];
        this.cd.markForCheck();
        return;
      }

      if (this.key() === key) {
        this.messages = [];
        this.cd.markForCheck();
        return;
      }
      this.cd.markForCheck();
    });
  }

  /**
   * Método que permite agregar un listado de items toast al listado de items toast
   * @param {Message[]} messages
   * @private
   */
  private add(messages: Message[]): void {
    this.messages = this.messages ? [...this.messages, ...messages] : [...messages];

    if (this.preventDuplicates()) {
      this.messagesArchive = this.messagesArchive ? [...this.messagesArchive, ...messages] : [...messages];
    }

    this.cd.markForCheck();
  }

  /**
   * Método que valida si un item toast se puede agregar al listado de items toast
   * @param {Message} message
   * @private
   */
  private canAdd(message: Message): boolean {
    let allow = this.key() === message.key;

    if (allow && this.preventOpenDuplicates()) {
      allow = !this.containsMessage(this.messages!, message);
    }

    if (allow && this.preventDuplicates()) {
      allow = !this.containsMessage(this.messagesArchive!, message);
    }

    return allow;
  }

  /**
   * Método que valida si ese item que se esta agregando ya esta agregado
   * @param {Message[]} collection
   * @param {Message} message
   * @private
   */
  private containsMessage(collection: Message[], message: Message): boolean {
    if (!collection) return false;
    return collection.find((m) => m.type === message.type && m.message == message.message) != null;
  }

  /**
   * Método que eliminar un item toast del listado de items toast por su indice en el listado
   * @param {number} index
   */
  public onMessageClose(index: number): void {
    this.messages?.splice(index, 1);

    this.cd.detectChanges();
  }

  onAnimationEnd($event: any) {

  }

  onAnimationStart($event: any) {

  }
}
