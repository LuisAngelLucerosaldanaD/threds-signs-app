import {Component, inject, OnDestroy, signal} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {EnvServiceFactory} from '../../../../core/services/env/env.service.provider';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {ToastService} from '../../../../core/services/ui/toast.service';
import {HttpErrorResponse} from '@angular/common/http';
import {IRegister} from '../../../../core/models/auth/session';
import {BlockUiComponent} from '../../../../core/ui/block-ui/block-ui.component';
import {ToastComponent} from '../../../../core/ui/toast/toast.component';
import {RecaptchaFormsModule, RecaptchaModule} from 'ng-recaptcha';
import {OnlyTextDirective} from '../../../../core/directives/only-text.directive';
import {OnlyNumberDirective} from '../../../../core/directives/only-number.directive';

@Component({
  selector: 'app-register',
  imports: [
    BlockUiComponent,
    ToastComponent,
    ReactiveFormsModule,
    RecaptchaFormsModule,
    RecaptchaModule,
    OnlyTextDirective,
    OnlyNumberDirective,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnDestroy {
  // System
  private readonly _subscriptions: Subscription = new Subscription();
  private readonly _router = inject(Router);

  // Services
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);

  // readonly properties
  protected readonly captchaKey = signal(EnvServiceFactory().GOOGLE_RECAPTCHA_SITE_KEY);

  protected isLoading = signal(false);
  private timeoutHandle: any;

  protected registerForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    document: new FormControl('', [Validators.required]),
    type_document: new FormControl(0, [Validators.required]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    birthdate: new FormControl('', [Validators.required]),
    captcha: new FormControl('', [Validators.required]),
  });

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.captchaKey.set('');
    clearTimeout(this.timeoutHandle);
  }

  protected async register(): Promise<void> {
    if (this.registerForm.invalid) {
      this._toastService.add({
        type: 'error',
        message: 'Complete correctamente los campos requeridos',
      });
      this.registerForm.markAllAsTouched();
      return;
    }

    const data: IRegister = {
      name: this.registerForm.value.name.trim(),
      lastname: this.registerForm.value.lastname.trim(),
      document: this.registerForm.value.document.trim(),
      type_document: parseInt(this.registerForm.value.type_document),
      username: this.registerForm.value.username.trim(),
      password: this.registerForm.value.password.trim(),
      email: this.registerForm.value.email.trim(),
      birthdate: this.registerForm.value.birthdate.trim() + 'T00:00:00Z',
    };

    this.isLoading.set(true);
    this._subscriptions.add(
      this._authService.register(data).subscribe({
        next: (res) => {
          if (!res.data) {
            this._toastService.add({
              type: 'error',
              message: res.msg
            });
            return;
          }

          this._toastService.add({
            type: 'success',
            message: "Usuario registrado correctamente, por favor valide su correo electrónico"
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
