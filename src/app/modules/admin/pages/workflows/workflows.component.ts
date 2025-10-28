import { Component } from '@angular/core';
import {TableComponent} from '../../../../core/ui/table/table.component';
import {ToastComponent} from '../../../../core/ui/toast/toast.component';

@Component({
  selector: 'app-workflows',
  imports: [
    TableComponent,
    ToastComponent
  ],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss'
})
export class WorkflowsComponent {

}
