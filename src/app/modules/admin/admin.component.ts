import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {UserService} from '../../core/services/user/user.service';
import {Subscription} from 'rxjs';
import {ToastService} from '../../core/services/ui/toast.service';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthService} from '../../core/services/auth/auth.service';
import {UserStore} from '../../core/store/user.store';
import {liveQuery} from 'dexie';
import {db} from '../../core/services/db/db.service';
import {ToastComponent} from '../../core/ui/toast/toast.component';
import {BlockUiComponent} from '../../core/ui/block-ui/block-ui.component';

@Component({
  selector: 'app-admin',
  imports: [
    RouterOutlet,
    ToastComponent,
    BlockUiComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy {

  private readonly _subscriptions: Subscription = new Subscription();

  // Services
  private readonly _userService = inject(UserService);
  private readonly _toastService = inject(ToastService);
  private readonly _authService = inject(AuthService);

  // Store
  protected readonly _userStore = inject(UserStore);

  protected isLoading = signal(false);
  private timeRefresh: any;

  protected user$ = liveQuery(
    () => this._getUserFromDB()
  );

  async ngOnInit() {
    this._subscriptions.add(
      this.user$.subscribe((user) => {
        if (user) {
          this._userStore.setUser({...user});
          return;
        }

        const id = this._authService.getUser();
        this._loadUserProfile(id);
      })
    );
    this.refreshToken();
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    clearTimeout(this.timeRefresh);
  }

  private _loadUserProfile(userId: string) {
    this.isLoading.set(true);
    this._subscriptions.add(
      this._userService.getUserProfile(userId).subscribe({
        next: (res) => {
          if (res.error) {
            this._toastService.add({type: "error", message: res.msg});
            return;
          }
          this._userStore.setUser({...res.data});
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this._toastService.add({type: "error", message: err.message});
          this.isLoading.set(false);
        },
        complete: () => this.isLoading.set(false),
      })
    );
  }

  private async _getUserFromDB() {
    const id = this._authService.getUser();
    return db.userTable.where({id}).first();
  }

  private refreshToken(): void {
    this.timeRefresh = setTimeout(() => {
      if (this._authService.mustRefreshToken()) {
        this._authService.refreshToken().subscribe({
          next: (res) => {
            if (res.error) {
              this._toastService.add({type: "error", message: res.msg});
              this._authService.clearSession();
              return;
            }
          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
            this._toastService.add({type: "error", message: err.message});
            this._authService.clearSession();
          }
        });
      }
    }, 10000);
  }

}
