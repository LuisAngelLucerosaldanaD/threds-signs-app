import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {ToastService} from '../../../../core/services/ui/toast.service';
import {HttpErrorResponse} from '@angular/common/http';
import {BlockUiComponent} from '../../../../core/ui/block-ui/block-ui.component';
import {ToastComponent} from '../../../../core/ui/toast/toast.component';

@Component({
  selector: 'app-verify',
  imports: [
    BlockUiComponent,
    ToastComponent
  ],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss'
})
export class VerifyComponent implements OnDestroy, OnInit {
  // System
  private readonly _subscriptions: Subscription = new Subscription();
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  // Services
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);

  protected isLoading = signal(false);
  private timeoutHandle: any;

  ngOnInit() {
    this._verifyAccount();
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    clearTimeout(this.timeoutHandle);
  }

  private async _verifyAccount(): Promise<void> {
    const otp = this._route.snapshot.queryParamMap.get('otp');
    if (!otp) {
      this._toastService.add({
        type: 'error',
        message: 'Código OTP no proporcionado',
      });

      this.timeoutHandle = setTimeout(() => {
        this._router.navigate(['/auth/login']).then();
      }, 3000);
      return;
    }

    let geo;
    try {
      geo = await this._authService.getGeolocation();
    } catch (error) {
      this._toastService.add({
        type: 'warning',
        message: 'No se pudo obtener la geolocalización, asegurese de tener los permisos habilitados'
      });
      return;
    }

    this.isLoading.set(true);
    this._subscriptions.add(
      this._authService.verifyAccount(otp, `${geo.latitude},${geo.longitude}`).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({type: 'error', message: res.msg});
            return;
          }

          this._toastService.add({
            type: 'success',
            message: 'Se ha validado la cuenta correctamente, en un momento sera dirigido al inicio de sesión'
          });
          this.timeoutHandle = setTimeout(() => {
            this._router.navigate(['/auth/login']).then();
          }, 2000);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);
          console.error(error);
          this._toastService.add({type: 'error', message: error.error.msg});
          return;
        },
        complete: () => this.isLoading.set(false)
      })
    );
  }

}
