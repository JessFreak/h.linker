import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AddJuryDTO,
  CreateHackathonDTO,
  FullHackathonResponse,
  HackathonsResponse,
  HackathonStatus,
  SetCategoriesDTO,
  SetCriteriaDTO,
  UpdateHackathonDTO,
  UserRegistrationStatusResponse,
} from '@h.linker/libs';

@Injectable({
  providedIn: 'root',
})
export class HackathonService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/hackathons';

  getAll(): Observable<HackathonsResponse> {
    return this.http.get<HackathonsResponse>(this.baseUrl);
  }

  getById(id: string): Observable<FullHackathonResponse> {
    return this.http.get<FullHackathonResponse>(`${this.baseUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<FullHackathonResponse> {
    return this.http.get<FullHackathonResponse>(`${this.baseUrl}/s/${slug}`);
  }

  create(dto: CreateHackathonDTO): Observable<FullHackathonResponse> {
    return this.http.post<FullHackathonResponse>(this.baseUrl, dto);
  }

  update(
    id: string,
    dto: UpdateHackathonDTO,
  ): Observable<FullHackathonResponse> {
    return this.http.patch<FullHackathonResponse>(`${this.baseUrl}/${id}`, dto);
  }

  updateStatus(
    id: string,
    status: HackathonStatus,
  ): Observable<FullHackathonResponse> {
    return this.http.patch<FullHackathonResponse>(
      `${this.baseUrl}/${id}/status`,
      {
        status,
      },
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  setCriteria(id: string, criteria: SetCriteriaDTO): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/criteria`, criteria);
  }

  setCategories(id: string, categories: SetCategoriesDTO): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/categories`, categories);
  }

  addJury(id: string, dto: AddJuryDTO): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/jury`, dto);
  }

  removeJury(id: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/jury/${userId}`);
  }

  getRegistrationStatus(
    id: string,
  ): Observable<UserRegistrationStatusResponse> {
    return this.http.get<UserRegistrationStatusResponse>(
      `${this.baseUrl}/${id}/registration-status`,
    );
  }

  registerTeam(hackathonId: string, teamId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${hackathonId}/register`, {
      teamId,
    });
  }
}
