import {Directive, ElementRef, HostListener, inject} from '@angular/core';

@Directive({
  selector: '[onlyNumber]'
})
export class OnlyNumberDirective {

  private regex: RegExp = /^[0-9]$/;
  private _el = inject(ElementRef);

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') return;

    const current: string = event.key;
    if (!this.regex.test(current)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedInput: string = event.clipboardData?.getData('text/plain') || '';
    const cleanedInput = pastedInput
      .split('')
      .filter(char => this.regex.test(char))
      .join('');

    document.execCommand('insertText', false, cleanedInput);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    const textData = event.dataTransfer?.getData('text') || '';
    this._el.nativeElement.value = textData
      .split('')
      .filter(char => this.regex.test(char))
      .join('');
  }

}
