import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginDTO, RegisterDTO, UserResponse } from '@h.linker/libs';

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

  setUser(): void {
    if (localStorage.getItem('isAuthorised') !== 'true') {
      return;
    }

    this.http.get<UserResponse>(`${this.baseUrl}/me`).subscribe({
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
    this.http
      .post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.userSubject.next(null);
          localStorage.removeItem('isAuthorised');
        },
        error: () => {
          this.userSubject.next(null);
          localStorage.removeItem('isAuthorised');
        },
      });
  }

  loginWithGoogle(): void {
    window.location.href = `${this.baseUrl}/google`;
  }

  loginWithGitHub(): void {
    window.location.href = `${this.baseUrl}/github`;
  }
}
