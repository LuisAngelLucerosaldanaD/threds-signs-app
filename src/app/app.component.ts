import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CsrfTokenService} from './core/services/security/csrf-token.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'threds-signs-app';
  private readonly _csrfService = inject(CsrfTokenService);

  constructor() {
    const csrfToken = this._csrfService.getCsrfStorage();
    if (!csrfToken) {
      this._csrfService.initializeCsrfToken();
    }
  }
}
