import {Component, inject} from '@angular/core';
import {DIALOG_DATA, DialogRef} from '@angular/cdk/dialog';

@Component({
  selector: 'app-confirm-container',
  imports: [],
  templateUrl: './confirm-container.component.html',
  styleUrl: './confirm-container.component.scss'
})
export class ConfirmContainerComponent {
  protected data = inject(DIALOG_DATA);
  protected dialogRef = inject<DialogRef<boolean>>(DialogRef<string>);
}
