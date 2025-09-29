import {Component, input} from '@angular/core';

@Component({
  selector: 'app-block-ui',
  imports: [],
  templateUrl: './block-ui.component.html',
  styleUrl: './block-ui.component.scss'
})
export class BlockUiComponent {
  public show = input.required<boolean>();
}
