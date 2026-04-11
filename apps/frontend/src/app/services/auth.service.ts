import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import {
  LoginDTO,
  RegisterDTO,
  UpdatePasswordDTO,
  UserResponse,
} from '@h.linker/libs';

@Injectable({ providedIn: 'root' })
class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = '/api/auth';
  private readonly AUTH_KEY = 'isAuthorised';

  private readonly userSubject = new BehaviorSubject<UserResponse | null>(null);
  user$ = this.userSubject.asObservable();

  register(registerForm: RegisterDTO): Observable<object> {
    return this.http.post(`${this.baseUrl}/register`, registerForm);
  }

  login(loginForm: LoginDTO): Observable<object> {
    return this.http.post(`${this.baseUrl}/login`, loginForm).pipe(
      tap(() => {
        this.setAuthState(true);
        this.setUser();
      }),
    );
  }

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/me`).pipe(
      tap((user) => {
        this.userSubject.next(user);
        this.setAuthState(true);
      }),
      catchError((err) => {
        this.clearAuthState();
        return of(err);
      }),
    );
  }

  setUser(): void {
    if (localStorage.getItem(this.AUTH_KEY) === 'true') {
      this.getMe().subscribe();
    }
  }

  logout(): void {
    this.clearAuthState();
    this.http
      .post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => this.router.navigate(['/login']),
      });
  }

  deleteMe(): void {
    this.http.delete(`${this.baseUrl}/me`).subscribe({
      next: () => {
        this.clearAuthState();
        this.router.navigate(['/login']);
      },
    });
  }

  private setAuthState(isAuth: boolean): void {
    if (isAuth) {
      localStorage.setItem(this.AUTH_KEY, 'true');
    } else {
      this.clearAuthState();
    }
  }

  private clearAuthState(): void {
    localStorage.removeItem(this.AUTH_KEY);
    this.userSubject.next(null);
  }

  updateUserState(user: UserResponse): void {
    this.userSubject.next(user);
  }

  loginWithGoogle(): void {
    window.location.href = `${this.baseUrl}/google`;
  }

  loginWithGitHub(): void {
    window.location.href = `${this.baseUrl}/github`;
  }

  connectGitHub(): void {
    window.location.href = `${this.baseUrl}/github/connect`;
  }

  updatePassword(passwordForm: UpdatePasswordDTO): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.baseUrl}/password`,
      passwordForm,
    );
  }
}

export default AuthService;
