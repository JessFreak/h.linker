import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  LoginDTO,
  RegisterDTO,
  UpdatePasswordDTO,
  UserResponse,
} from '@h.linker/libs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  private readonly userSubject = new BehaviorSubject<UserResponse | null>(null);
  user$ = this.userSubject.asObservable();

  register(registerForm: RegisterDTO): Observable<object> {
    return this.http.post(`${this.baseUrl}/register`, registerForm);
  }

  login(loginForm: LoginDTO): Observable<object> {
    return this.http.post(`${this.baseUrl}/login`, loginForm).pipe(
      tap(() => {
        localStorage.setItem('isAuthorised', 'true');
        this.setUser();
      }),
    );
  }

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/me`).pipe(
      tap((user) => {
        this.userSubject.next(user);
        localStorage.setItem('isAuthorised', 'true');
      }),
    );
  }

  updateUserState(user: UserResponse): void {
    this.userSubject.next(user);
  }

  setUser(): void {
    if (localStorage.getItem('isAuthorised') !== 'true') {
      return;
    }

    this.getMe().subscribe({
      next: (user) => {
        this.userSubject.next(user);
      },
      error: () => {
        this.userSubject.next(null);
        localStorage.removeItem('isAuthorised');
      },
    });
  }

  logout(): void {
    localStorage.removeItem('isAuthorised');
    this.userSubject.next(null);

    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true });
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

  deleteMe(): void {
    this.http.delete(`${this.baseUrl}/me`, {}).subscribe({
      next: () => {
        localStorage.removeItem('isAuthorised');
        this.userSubject.next(null);
      },
      error: (err) => {
        console.error('Failed to delete account', err);
      },
    });
  }

  updatePassword(passwordForm: UpdatePasswordDTO): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.baseUrl}/password`,
      passwordForm,
    );
  }
}
