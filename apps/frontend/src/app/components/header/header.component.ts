import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotificationService } from '../../utils/notification.service';
import AuthService from '../../services/auth.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    NgOptimizedImage,
    MatTooltip,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  public user = toSignal(this.authService.user$);

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('auth') === 'success') {
      localStorage.setItem('isAuthorised', 'true');
      this.notify.success('Logged in successfully');

      this.router.navigate([], {
        queryParams: { auth: null },
        queryParamsHandling: 'merge',
      });
    }

    this.authService.setUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
