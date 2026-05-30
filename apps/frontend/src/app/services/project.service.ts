import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PageResponse,
  ProjectQueryDTO,
  ShowcaseProjectResponse,
} from '@h.linker/libs';
import { environment } from '../../environments/environment';
import { HttpUtils } from '../utils/http.utils';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/projects`;

  getShowcase(
    query: Partial<ProjectQueryDTO> = {},
  ): Observable<PageResponse<ShowcaseProjectResponse>> {
    const params = HttpUtils.buildQueryParams(query);

    return this.http.get<PageResponse<ShowcaseProjectResponse>>(this.baseUrl, {
      params,
    });
  }
}
