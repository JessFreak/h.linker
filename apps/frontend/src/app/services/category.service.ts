import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategorySearchResponse } from '@h.linker/libs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/categories';

  searchCategories(query: string): Observable<CategorySearchResponse> {
    return this.http.get<CategorySearchResponse>(this.baseUrl, {
      params: { q: query },
    });
  }
}