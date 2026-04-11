import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FullUserResponse, UpdateUserDTO, UserResponse } from '@h.linker/libs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  updateProfile(dto: UpdateUserDTO): Observable<UserResponse> {
    return this.http.patch<UserResponse>(this.baseUrl, dto);
  }

  getByUsername(username: string): Observable<FullUserResponse> {
    return this.http.get<FullUserResponse>(`${this.baseUrl}/${username}`);
  }

  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.baseUrl);
  }
}
