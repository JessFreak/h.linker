import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolesResponse } from '@h.linker/libs';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/roles';

  getAll(): Observable<RolesResponse> {
    return this.http.get<RolesResponse>(this.baseUrl);
  }
}
