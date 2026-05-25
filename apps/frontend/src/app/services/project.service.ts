import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectShowcaseResponse } from '@h.linker/libs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/projects`;

  getShowcase(): Observable<ProjectShowcaseResponse> {
    return this.http.get<ProjectShowcaseResponse>(`${this.baseUrl}/showcase`);
  }
}
