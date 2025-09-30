import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {BlockUiComponent} from "../../../../core/ui/block-ui/block-ui.component";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {RecaptchaFormsModule, RecaptchaModule} from "ng-recaptcha";
import {ToastComponent} from "../../../../core/ui/toast/toast.component";
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {ToastService} from '../../../../core/services/ui/toast.service';
import {EnvServiceFactory} from '../../../../core/services/env/env.service.provider';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  imports: [
    BlockUiComponent,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaFormsModule,
    ToastComponent,
    RecaptchaModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnDestroy, OnInit {
  // System
  private readonly _subscriptions: Subscription = new Subscription();
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  // Services
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);

  // readonly properties
  protected readonly captchaKey = signal(EnvServiceFactory().GOOGLE_RECAPTCHA_SITE_KEY);

  protected isLoading = signal(false);
  private timeoutHandle: any;

  protected resetForm: FormGroup = new FormGroup({
    otp: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    captcha: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    const code = this._route.snapshot.queryParams['code'];
    if (!code) {
      this._toastService.add({
        type: 'warning',
        message: "No reset code provided. Please check your email for the reset link."
      });
      this.timeoutHandle = setTimeout(() => {
        this._router.navigate(['/auth/login']).then();
      }, 3000);
    }

    this.resetForm.get('otp')?.setValue(code);
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.captchaKey.set('');
    clearTimeout(this.timeoutHandle);
    this.resetForm.reset();
  }

  protected get password(): FormControl {
    return this.resetForm.get('password') as FormControl;
  }

  protected resetPassword(): void {
    if (this.resetForm.invalid) {
      this._toastService.add({
        type: 'error',
        message: 'Complete correctamente los campos requeridos',
      });
      this.resetForm.markAllAsTouched();
      return;
    }

    const {otp, password} = this.resetForm.value;
    this.isLoading.set(true);
    this._subscriptions.add(
      this._authService.resetPassword(otp, password).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({type: 'error', message: res.msg});
            return;
          }

          this._toastService.add({
            type: 'success',
            message: 'Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...',
          });
          this._authService.clearTempToken();
          this.timeoutHandle = setTimeout(() => {
            this._router.navigate(['/auth/login']).then();
          }, 3000);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);
          this._toastService.add({
            type: 'error',
            message: error?.error?.message || 'Error al restablecer la contraseña. Inténtelo de nuevo.',
          });
          this.resetForm.get('captcha')?.setValue('');
        },
        complete: () => this.isLoading.set(false)
      })
    );
  }
}
