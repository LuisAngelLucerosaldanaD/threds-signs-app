import {Component, inject, OnDestroy, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {EnvServiceFactory} from '../../../../core/services/env/env.service.provider';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {RecaptchaFormsModule, RecaptchaModule} from 'ng-recaptcha';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {ICredentials} from '../../../../core/models/auth/session';
import {BlockUiComponent} from '../../../../core/ui/block-ui/block-ui.component';
import {ToastComponent} from '../../../../core/ui/toast/toast.component';
import {ToastService} from '../../../../core/services/ui/toast.service';

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

  // readonly properties
  protected readonly captchaKey = signal(EnvServiceFactory().GOOGLE_RECAPTCHA_SITE_KEY);

  protected loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', Validators.required),
    remember_me: new FormControl(false),
    captcha: new FormControl('', Validators.required)
  });

  protected isLoading = signal(false);

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.loginForm.reset();
    this.isLoading.set(false);
    this.captchaKey.set('');
  }

  protected get username(): FormControl {
    return this.loginForm.get('username') as FormControl;
  }

  protected get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  protected async login(): Promise<void> {
    if (this.loginForm.invalid) {
      this._toastService.add({
        type: 'error',
        message: 'Complete correctamente los campos requeridos',
      });
      this.loginForm.markAllAsTouched();
      return;
    }

    let geo;
    try {
      geo = await this._authService.getGeolocation();
    } catch (error) {
      this._toastService.add({
        type: 'warn',
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
          if (!res.data) {
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
}
