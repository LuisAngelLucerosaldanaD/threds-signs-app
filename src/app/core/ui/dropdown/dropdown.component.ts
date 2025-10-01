import {
  booleanAttribute,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, inject, InjectionToken, input,
  Input, numberAttribute, Output,
  ViewChild
} from '@angular/core';
import {CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition, Overlay, ScrollStrategy} from '@angular/cdk/overlay';
import {animate, animateChild, query, style, transition, trigger, state} from '@angular/animations';
import {NgControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {ESCAPE, hasModifierKey} from '@angular/cdk/keycodes';

export const TRS_SELECT_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'trs-select-scroll-strategy',
  {
    providedIn: 'root',
    factory: () => {
      const overlay = inject(Overlay);
      return () => overlay.scrollStrategies.reposition();
    },
  },
);

@Component({
  selector: 'trs-dropdown',
  imports: [
    CdkConnectedOverlay,
    CdkOverlayOrigin,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'combobox',
    'aria-haspopup': 'listbox',
    '[attr.tabindex]': 'disabled ? -1 : tabIndex',
    'class': 'w-full block',
    '(blur)': '_onBlur()',
    '(focus)': '_onFocus()',
    '[class.focused]': 'focused',
  },
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  animations: [
    trigger('transformPanelWrap', [
      transition('* => void', query('@transformPanel', [animateChild()], {optional: true})),
    ]),
    trigger('transformPanel', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'scale(1, 0.8)',
        }),
      ),
      transition(
        'void => showing',
        animate(
          '120ms cubic-bezier(0, 0, 0.2, 1)',
          style({
            opacity: 1,
            transform: 'scale(1, 1)',
          }),
        ),
      ),
      transition('* => void', animate('100ms linear', style({opacity: 0}))),
    ])
  ],
})
export class DropdownComponent {
  @ViewChild('trigger') trigger!: ElementRef;
  icon = input(true);
  @Input({required: true}) data: any[] = [];
  @Input() optionName: string = 'name';
  @Input() optionValue: string = 'value';
  @Input() placeholder: string = 'Select an option';
  @Output('on-change') change: EventEmitter<{ value: any, itemValue: any }> = new EventEmitter<{
    itemValue: any,
    value: any
  }>();

  @Input({transform: booleanAttribute})
  get multiple(): boolean {
    return this._multiple;
  }

  set multiple(value: boolean) {
    this._multiple = value;
  }

  private _multiple: boolean = false;

  @Input({transform: booleanAttribute})
  disabled: boolean = false;

  @Input({
    transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)),
  })
  tabIndex: number = 0;

  private _scrollStrategyFactory = inject(TRS_SELECT_SCROLL_STRATEGY);
  protected _positions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      panelClass: 'mat-mdc-select-panel-above',
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      panelClass: 'mat-mdc-select-panel-above',
    },
  ];
  protected _scrollStrategy: ScrollStrategy;
  protected isOpen: boolean = false;
  protected triggerValue: string = '';
  protected _overlayWidth: string | number = 'auto';
  ngControl = inject(NgControl, {self: true, optional: true})!;
  _onChange: (value: any) => void = () => {
  };
  _onTouched = () => {
  };
  readonly stateChanges = new Subject<void>();
  protected _changeDetectorRef = inject(ChangeDetectorRef);

  get focused(): boolean {
    return this._focused || this.isOpen;
  }

  private _focused = false;

  constructor() {
    this._scrollStrategy = this._scrollStrategyFactory();

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.data = this.data.map((item) => {
      item['_idOption'] = crypto.randomUUID();
      item['selected'] = false;
      return item;
    });
  }

  public open(): void {
    if (!this.data.length || this.disabled) return;
    this.isOpen = true;
    this._overlayWidth = this.trigger.nativeElement.getBoundingClientRect().width;
  }

  public close(): void {
    this.isOpen = false;
  }

  public _handleOverlayKeydown(event: KeyboardEvent): void {
    if (event.keyCode === ESCAPE && !hasModifierKey(event)) {
      event.preventDefault();
      this.close();
    }
  }

  public _handleKeydown(event: KeyboardEvent): void {
    if (!this.disabled) {
      // this.isOpen ? this._handleOpenKeydown(event) : this._handleClosedKeydown(event);
    }
  }

  writeValue(value: any): void {
    this._assignValue(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }


  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  private _assignValue(newValue: any | any[]): boolean {
    if (!this.data) return false;
    if (newValue === null || newValue === undefined) {
      this.triggerValue = '';
      this.data.forEach((item) => item['selected'] = false);
      this._changeDetectorRef.markForCheck();
      return true;
    }
    if (this._multiple && Array.isArray(newValue)) {
      this.data.forEach((item) => {
        item['selected'] = newValue.includes(item[this.optionValue]);
      });
      this.triggerValue = this.data.filter((item) => item['selected']).map((item) => item[this.optionValue]).join(', ');
      this._changeDetectorRef.markForCheck();
      return true;
    }

    if (this._multiple && typeof newValue === 'string') {
      const values = newValue.split(',').map((item) => item.trim());
      this.data.forEach((item) => {
        item['selected'] = values.includes(item[this.optionValue]);
      });
      this.triggerValue = this.data.filter((item) => item['selected']).map((item) => item[this.optionValue]).join(', ');
      this._changeDetectorRef.markForCheck();
      return true;
    }

    const index = this.data.findIndex((item) => item[this.optionValue] === newValue);
    if (index === -1) return false;
    this.data[index]['selected'] = true;
    this.triggerValue = newValue;
    this._changeDetectorRef.markForCheck();
    return false;
  }

  private _setTriggerValue(value: any): string {
    const index = this.data.findIndex((item) => item['_idOption'] === value);
    if (!this.multiple) {
      this.data.forEach((item) => {
        if (item['_idOption'] !== value) {
          item['selected'] = false;
        }
      });

      this.data[index]['selected'] = !this.data[index]['selected'];
      this.triggerValue = this.data[index][this.optionValue];
      this.change.emit({itemValue: this.data[index], value: this.triggerValue});
      this.close();
      this._changeDetectorRef.markForCheck();
      return this.triggerValue;
    }

    this.data[index]['selected'] = !this.data[index]['selected'];
    const values = this.data.filter((item) => item['selected']).map((item) => item[this.optionValue]);
    this.triggerValue = values.join(', ');
    this.change.emit({value: values, itemValue: this.data[index]});
    this._changeDetectorRef.markForCheck();
    return this.triggerValue;
  }

  protected selectOption(id: any): void {
    const value = this._setTriggerValue(id);
    this._onChange(value);
    this._onTouched();
  }

  get empty(): boolean {
    return !this.triggerValue || this.data.length === 0;
  }

  _onBlur() {

    if (!this.disabled && !this.isOpen) {
      this._onTouched();
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
    }
  }

  _onFocus() {
    if (!this.disabled) {
      this._focused = true;
      this.stateChanges.next();
    }
  }
}
