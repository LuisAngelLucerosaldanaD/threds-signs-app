import {Component, inject, OnDestroy, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {EnvServiceFactory} from '../../../../core/services/env/env.service.provider';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {RecaptchaFormsModule, RecaptchaModule} from 'ng-recaptcha';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {ICredentials, IOtp} from '../../../../core/models/auth/session';
import {BlockUiComponent} from '../../../../core/ui/block-ui/block-ui.component';
import {ToastComponent} from '../../../../core/ui/toast/toast.component';
import {ToastService} from '../../../../core/services/ui/toast.service';
import {TYPE_AUTH_CODES} from '../../../../core/utils/constants/auth';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RecaptchaFormsModule,
    RecaptchaModule,
    BlockUiComponent,
    ToastComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
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
  protected is2fa = signal(false);

  protected loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', Validators.required),
    remember_me: new FormControl(false),
    captcha: new FormControl('', Validators.required),
    otp: new FormControl(''),
  });

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.loginForm.reset();
    this.isLoading.set(false);
    this.is2fa.set(false);
    this.captchaKey.set('');
  }

  protected get username(): FormControl {
    return this.loginForm.get('username') as FormControl;
  }

  protected get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  protected get otp(): FormControl {
    return this.loginForm.get('otp') as FormControl;
  }

  protected enable2fa(): void {
    this.loginForm.get('password')?.disable();
    this.loginForm.get('password')?.updateValueAndValidity();
    this.loginForm.get('username')?.disable();
    this.loginForm.get('username')?.updateValueAndValidity();

    this.loginForm.get('otp')?.setValidators(Validators.required);
    this.loginForm.get('otp')?.updateValueAndValidity();
  }

  protected handleLogin(): void {
    if (this.loginForm.invalid) {
      this._toastService.add({
        type: 'error',
        message: 'Complete correctamente los campos requeridos',
      });
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.is2fa()) {
      this.loginWithOtp();
      return;
    }

    this.login();
  }

  private async loginWithOtp(): Promise<void> {
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

    const data: IOtp = {
      otp: this.loginForm.value.otp.trim(),
      coordinates: `${geo.latitude},${geo.longitude}`,
      remember_me: this.loginForm.value.remember_me
    };
    this.isLoading.set(true);
    this._subscriptions.add(
      this._authService.loginWithOtp(data).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({
              type: 'error',
              message: res.msg
            });
            return;
          }

          this._router.navigateByUrl('/admin');
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

  private async login(): Promise<void> {
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

    const data = this.loginForm.value;
    delete data.captcha;
    const loginData: ICredentials = {
      username: data.username,
      password: data.password,
      remember_me: data.remember_me,
      coordinates: `${geo.latitude},${geo.longitude}`
    };
    this.isLoading.set(true);
    this._subscriptions.add(
      this._authService.login(loginData).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({
              type: 'error',
              message: res.msg
            });
            return;
          }

          if (res.code === TYPE_AUTH_CODES.TwoFa) {
            this._toastService.add({
              type: 'info',
              message: "Se ha enviado el código de autenticación a su correo."
            });
            this.is2fa.set(true);
            this.enable2fa();
            return;
          }

          this._router.navigateByUrl('/admin');
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
