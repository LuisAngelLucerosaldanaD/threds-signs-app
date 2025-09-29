import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  NgZone,
  OnDestroy,
  output
} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Message} from '../../models/ui/toast';

@Component({
  selector: 'app-toast-item',
  imports: [],
  templateUrl: './toast-item.component.html',
  styleUrl: './toast-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('messageState', [
      state(
        'visible',
        style({
          transform: 'translateY(0)',
          opacity: 1
        })
      ),
      transition('void => *', [style({
        transform: '{{showTransformParams}}',
        opacity: 0
      }), animate('{{showTransitionParams}}')]),
      transition('* => void', [
        animate(
          '{{hideTransitionParams}}',
          style({
            height: 0,
            opacity: 0,
            transform: '{{hideTransformParams}}'
          })
        )
      ])
    ])
  ],
})
export class ToastItemComponent implements OnDestroy, AfterViewInit {
  message = input.required<Message>();
  index = input<number>(-1);
  showTransformOptions = input<string>();
  hideTransformOptions = input<string>();
  showTransitionOptions = input<string>();
  hideTransitionOptions = input<string>();
  onClose = output<number>();

  private _zone = inject(NgZone);
  private timeout: any = null;

  ngAfterViewInit(): void {
    this.initTimeout();
  }

  ngOnDestroy() {
    this.clearTimeout();
  }

  /**
   * Método que limpia el contador de vida del item toast
   * @private
   */
  private clearTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  /**
   * Método que limpiar el contador cuando el usaurio da click en el item toast
   */
  public onMouseEnter(): void {
    this.clearTimeout();
  }

  /**
   * Método que reinicia el contador cuando el usaurio tenga el mouse sobre el item toast
   */
  public onMouseLeave(): void {
    this.initTimeout();
  }

  /**
   * Método que inicia el contador para eliminar el toast del listado de toasts
   * @private
   */
  private initTimeout(): void {
    this._zone.runOutsideAngular(() => {
      this.timeout = setTimeout(() => {
        this.onClose.emit(this.index());
      }, this.message().life || 3000);
    });
  }
}
