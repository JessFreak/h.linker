import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginDTO, RegisterDTO } from '@h.linker/libs';
import { User } from '@prisma/client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  register(registerForm: RegisterDTO): Observable<object> {
    return this.http.post(`${this.baseUrl}/register`, registerForm);
  }

  login(loginForm: LoginDTO): Observable<object> {
    return this.http.post(`${this.baseUrl}/login`, loginForm);
  }

  setUser(): void {
    if (!localStorage.getItem('isAuthorised')) return;

    this.http
      .get<User>(`${this.baseUrl}/me`, { withCredentials: true })
      .subscribe((user) => {
        this.userSubject.next(user);
        localStorage.setItem('isAuthorised', 'true');
      });
  }

  logout(): void {
    this.http
      .post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .subscribe(() => {
        this.userSubject.next(null);
        localStorage.removeItem('isAuthorised');
      });
  }
}
