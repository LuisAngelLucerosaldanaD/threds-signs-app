import {Component, inject, OnDestroy, output, signal} from '@angular/core';
import {UserStore} from '../../../../core/store/user.store';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {OnlyTextDirective} from '../../../../core/directives/only-text.directive';
import {formatDate} from '@angular/common';
import {UserService} from '../../../../core/services/user/user.service';
import {Subscription} from 'rxjs';
import {ToastService} from '../../../../core/services/ui/toast.service';
import {IChangePassword, IReqUser, IUpdatePhoto} from '../../../../core/models/user/user';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastComponent} from '../../../../core/ui/toast/toast.component';
import {BlockUiComponent} from '../../../../core/ui/block-ui/block-ui.component';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {ConfirmComponent} from '../../../../core/ui/confirm/confirm.component';
import {ConfirmService} from '../../../../core/services/ui/confirm.service';
import {FileHelper} from '../../../../core/utils/file/file';

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    OnlyTextDirective,
    ToastComponent,
    BlockUiComponent,
    ConfirmComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnDestroy {

  // I/O properties
  public close = output<void>();

  // System properties
  private readonly _subscriptions: Subscription = new Subscription();

  // Services
  private readonly _userServices = inject(UserService);
  private readonly _toastService = inject(ToastService);
  private readonly _authServices = inject(AuthService);
  private readonly _confirmService = inject(ConfirmService);

  // Store
  protected readonly _userStore = inject(UserStore);

  // Signals
  protected tab = signal<'info' | 'pwd' | 'security'>('info');
  protected isLoading = signal<boolean>(false);
  protected profile = signal('');
  protected profileName = signal('');

  // Forms
  protected userForm: FormGroup = new FormGroup({
    name: new FormControl(this._userStore.user()?.name, [Validators.required]),
    lastname: new FormControl(this._userStore.user()?.lastname, [Validators.required]),
    document: new FormControl({value: this._userStore.user()?.document, disabled: true}, [Validators.required]),
    type_document: new FormControl({
      value: this._userStore.user()?.type_document,
      disabled: true
    }, [Validators.required]),
    username: new FormControl({value: this._userStore.user()?.username, disabled: true}, [Validators.required]),
    email: new FormControl(this._userStore.user()?.email, [Validators.required, Validators.email]),
    birthdate: new FormControl({
      value: formatDate(this._userStore.user()?.birthdate || '', 'yyyy-MM-dd', 'en', 'UTC'),
      disabled: true
    }, [Validators.required]),
  });
  protected pwdForm: FormGroup = new FormGroup({
    current_password: new FormControl('', [Validators.required]),
    new_password: new FormControl('', [Validators.required]),
    confirm_password: new FormControl('', [Validators.required]),
  });
  protected secForm: FormGroup = new FormGroup({
    verified_email: new FormControl({
      value: this._userStore.user()?.setting.email_verified_at || 'No verificado',
      disabled: true
    }),
    verified_sms: new FormControl({
      value: this._userStore.user()?.setting.sms_verified_at || 'No verificado',
      disabled: true
    }),
    required_2fa: new FormControl(this._userStore.user()?.setting.required_2fa),
  });

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  private _updateSettings(): void {
    this.isLoading.set(true);
    this._subscriptions.add(
      this._authServices.updateSettings(this.secForm.get('required_2fa')?.value).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({type: "error", message: res.msg});
            return;
          }

          this._toastService.add({type: 'success', message: 'Configuración de seguridad actualizada correctamente.'});
          this.secForm.markAsPristine();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this._toastService.add({
            type: 'error',
            message: err.message || 'Error al actualizar la configuración de seguridad.'
          });
          this.isLoading.set(false);
        },
        complete: () => this.isLoading.set(false)
      })
    );
  }

  private _updatePhoto(): void {
    if (!this.profile()) {
      this._toastService.add({type: 'error', message: 'Por favor, seleccione una imagen.'});
      return;
    }

    const data: IUpdatePhoto = {
      id: this._userStore.user()?.id || '',
      picture: this.profile(),
      name: this.profileName()
    };

    this.isLoading.set(true);
    this._subscriptions.add(
      this._userServices.updateProfilePicture(data).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({type: "error", message: res.msg});
            return;
          }

          this._toastService.add({type: 'success', message: 'Foto de perfil actualizada correctamente.'});
          this.profile.set('');
          this.profileName.set('');
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this._toastService.add({type: 'error', message: err.message || 'Error al actualizar la foto de perfil.'});
          this.isLoading.set(false);
        },
        complete: () => this.isLoading.set(false)
      })
    );
  }

  protected processProfile(ev: any): void {
    const file: File = ev.target.files[0];
    if (!file) return;

    const mimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!mimeTypes.includes(file.type)) {
      this._toastService.add({type: 'error', message: 'El archivo debe ser una imagen (png, jpg, jpeg).'});
      return;
    }

    if (file.size > (2 * 1024 * 1024)) {
      this._toastService.add({type: 'error', message: 'El tamaño de la imagen no debe exceder los 2MB.'});
      return;
    }

    this._subscriptions.add(
      FileHelper.fileReader(file).subscribe({
        next: res => {
          this.profileName.set(file.name);
          this.profile.set(res.split(',')[1]);
          this._updatePhoto();
        },
        error: (err) => {
          console.error(err);
          this._toastService.add({type: 'error', message: err.error.msg});
        }
      })
    );
  }

  protected updateUser(): void {
    if (this.userForm.invalid) {
      this._toastService.add({type: 'error', message: 'Por favor, complete todos los campos correctamente.'});
      this.userForm.markAllAsTouched();
      return;
    }

    const data: IReqUser = {
      id: this._userStore.user()?.id || '',
      name: this.userForm.value.name,
      lastname: this.userForm.value.lastname,
      document: this._userStore.user()?.document || '',
      type_document: this._userStore.user()?.type_document || 1,
      email: this.userForm.value.email,
      birthdate: this._userStore.user()?.birthdate || '',
    };

    this.isLoading.set(true);
    this._subscriptions.add(
      this._userServices.updateUserProfile(data).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({type: "error", message: res.msg});
            return;
          }

          this._toastService.add({type: 'success', message: 'Perfil actualizado correctamente.'});
          this.userForm.markAsPristine();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this._toastService.add({type: 'error', message: err.message || 'Error al actualizar el perfil.'});
          this.isLoading.set(false);
        },
        complete: () => this.isLoading.set(false)
      })
    );

  }

  protected changePassword(): void {
    if (this.pwdForm.invalid) {
      this._toastService.add({type: 'error', message: 'Por favor, complete todos los campos correctamente.'});
      this.pwdForm.markAllAsTouched();
      return;
    }

    if (this.pwdForm.value.new_password !== this.pwdForm.value.confirm_password) {
      this._toastService.add({type: 'error', message: 'Las contraseñas no coinciden.'});
      this.pwdForm.markAllAsTouched();
      return;
    }

    const data: IChangePassword = {
      old_password: this.pwdForm.value.current_password,
      password: this.pwdForm.value.new_password,
    };

    this.isLoading.set(true);
    this._subscriptions.add(
      this._authServices.changePassword(data).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({type: "error", message: res.msg});
            return;
          }

          this._toastService.add({
            type: 'success',
            message: 'Contraseña actualizada correctamente. Por favor, inicie sesión de nuevo.'
          });
          this.pwdForm.reset();
          this.pwdForm.markAsPristine();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this._toastService.add({type: 'error', message: err.message || 'Error al actualizar la contraseña.'});
          this.isLoading.set(false);
        },
        complete: () => this.isLoading.set(false)
      })
    );
  }

  protected changeSecuritySettings(): void {
    this._confirmService.confirm({
      header: 'Configuración de Seguridad',
      message: '¿Esta seguro de deshabilitar la autenticación de dos factores?',
      key: 'confirm',
      accept: () => this._updateSettings(),
    });
  }

}
