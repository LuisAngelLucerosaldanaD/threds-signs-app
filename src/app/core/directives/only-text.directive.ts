import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[onlyText]'
})
export class OnlyTextDirective {

  private regex: RegExp = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
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

}
