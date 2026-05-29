import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FullUserResponse,
  PageResponse,
  UpdateUserDTO,
  UserQueryDTO,
  UserResponse,
} from '@h.linker/libs';
import { HttpUtils } from '../utils/http.utils';

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

  getAll(
    query: Partial<UserQueryDTO> = {},
  ): Observable<PageResponse<UserResponse>> {
    const params = HttpUtils.buildQueryParams(query);

    return this.http.get<PageResponse<UserResponse>>(this.baseUrl, {
      params,
    });
  }
}
