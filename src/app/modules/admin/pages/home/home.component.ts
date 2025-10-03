import {Component, ElementRef, inject, OnInit, viewChild} from '@angular/core';
import {Chart} from 'chart.js/auto';
import {TableComponent} from '../../../../core/ui/table/table.component';
import {UserStore} from '../../../../core/store/user.store';

@Component({
  selector: 'app-home',
  imports: [
    TableComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  // Store
  protected readonly _userStore = inject(UserStore);

  protected reportCanvas = viewChild<ElementRef>('reportChart');

  ngOnInit() {
    const st = new Chart(this.reportCanvas()?.nativeElement, {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
          {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3, 12, 19, 3, 5, 2, 3],
            borderWidth: 1
          },
          {
            label: '# of test',
            data: [12, 19, 3, 5, 2, 3, 12, 19, 3, 5, 2, 3],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
      }
    });
  }

}
