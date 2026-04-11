import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import AuthService from '../../services/auth.service';
import { NotificationService } from '../../utils/notification.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly notify = inject(NotificationService);

  public isLogin = true;
  public loginForm!: FormGroup;
  public registerForm!: FormGroup;

  hide = signal(true);

  ngOnInit(): void {
    this.initForms();

    this.route.url.subscribe((urlSegments) => {
      this.isLogin = urlSegments.some((segment) => segment.path === 'login');

      if (this.isLogin) {
        this.fillLoginFormFromHistory();
      }
    });
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  private fillLoginFormFromHistory(): void {
    const navigationState = window.history.state;

    if (navigationState) {
      this.loginForm.patchValue({
        email: navigationState.email,
      });
    }
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.notify.success('Logged in successfully');
          this.router.navigate(['/']);
        },
      });
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      const { email } = this.registerForm.value;

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.notify.success('Account created successfully');
          this.router.navigate(['/login'], {
            state: { email },
          });
        },
      });
    }
  }
}
