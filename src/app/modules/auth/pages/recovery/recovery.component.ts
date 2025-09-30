import {Component, inject, OnDestroy, signal} from '@angular/core';
import {BlockUiComponent} from '../../../../core/ui/block-ui/block-ui.component';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {RecaptchaFormsModule, RecaptchaModule} from 'ng-recaptcha';
import {ToastComponent} from '../../../../core/ui/toast/toast.component';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {ToastService} from '../../../../core/services/ui/toast.service';
import {Subscription} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {EnvServiceFactory} from '../../../../core/services/env/env.service.provider';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-recovery',
  imports: [
    BlockUiComponent,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaFormsModule,
    RecaptchaModule,
    ToastComponent,
    RouterLink
  ],
  templateUrl: './recovery.component.html',
  styleUrl: './recovery.component.scss'
})
export class RecoveryComponent implements OnDestroy {
  // Services
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);

  // System
  private readonly _subscriptions: Subscription = new Subscription();
  private readonly _router = inject(Router);

  // Readonly properties
  protected readonly captchaKey = signal(EnvServiceFactory().GOOGLE_RECAPTCHA_SITE_KEY);

  // Signals properties
  protected isLoading = signal(false);
  private timeoutHandle: any;

  protected recoveryForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    captcha: new FormControl('', Validators.required)
  });

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.recoveryForm.reset();
    this.isLoading.set(false);
    this.captchaKey.set('');
    clearTimeout(this.timeoutHandle);
  }

  protected get email(): FormControl {
    return this.recoveryForm.get('email') as FormControl;
  }

  protected recovery(): void {
    if (this.recoveryForm.invalid) {
      this._toastService.add({
        type: 'error',
        message: 'Complete correctamente los campos requeridos',
      });
      this.recoveryForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this._subscriptions.add(
      this._authService.recovery(this.email.value).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({
              type: 'error',
              message: res.msg
            });
            return;
          }

          this._toastService.add({
            type: 'info',
            message: "Se ha enviado un correo electrónico con las instrucciones para recuperar su cuenta"
          });

          this.timeoutHandle = setTimeout(() => {
            this._router.navigateByUrl('/auth/login');
          }, 1500);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);
          console.error(error);
          this._toastService.add({
            type: 'error',
            message: error.error.msg
          });
          return;
        },
        complete: () => this.isLoading.set(false)
      })
    );

  }
}
