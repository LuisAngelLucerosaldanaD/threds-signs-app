import {Component, ElementRef, inject, OnDestroy, OnInit, signal, viewChild} from '@angular/core';
import {Chart} from 'chart.js/auto';
import {TableComponent} from '../../../../core/ui/table/table.component';
import {UserStore} from '../../../../core/store/user.store';
import {BiService} from '../../../../core/services/bi/bi.service';
import {Subscription} from 'rxjs';
import {ToastService} from '../../../../core/services/ui/toast.service';
import {ToastComponent} from '../../../../core/ui/toast/toast.component';
import {IReportSigners} from '../../../../core/models/bi/signers';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [
    TableComponent,
    ToastComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  private readonly _subscriptions: Subscription = new Subscription();

  private readonly _biService = inject(BiService);
  private readonly _toastService = inject(ToastService);

  // Store
  protected readonly _userStore = inject(UserStore);

  protected reportCanvas = viewChild<ElementRef>('reportChart');

  protected reportSigner = signal<IReportSigners>({
    pending: {count: 0, percentage: 0},
    signed: {count: 0, percentage: 0},
    unsigned: {count: 0, percentage: 0}
  });

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
    this._loadSignersReport();
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  private _loadSignersReport() {
    this._subscriptions.add(
      this._biService.getSignersReport(null, null).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({type: "error", message: res.msg});
            return;
          }

          const total = res.data.pending + res.data.signed + res.data.unsigned;

          this.reportSigner.set({
            pending: {count: res.data.pending, percentage: +(res.data.pending * 100 / total).toFixed(2)},
            signed: {count: res.data.signed, percentage: +(res.data.signed * 100 / total).toFixed(2)},
            unsigned: {count: res.data.unsigned, percentage: +(res.data.unsigned * 100 / total).toFixed(2)}
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this._toastService.add({type: "error", message: err.message || 'Error interno del servidor'});
        }
      })
    );
  }

}
