import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TeamResponse,
  TeamsResponse,
  CreateTeamDTO,
  UpdateTeamDTO,
  AddMemberDTO,
} from '@h.linker/libs';
import { UserTeamStatus } from '@prisma/client';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/teams';

  getAll(): Observable<TeamsResponse> {
    return this.http.get<TeamsResponse>(this.baseUrl);
  }

  getById(id: string): Observable<TeamResponse> {
    return this.http.get<TeamResponse>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateTeamDTO): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateTeamDTO): Observable<TeamResponse> {
    return this.http.patch<TeamResponse>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addMember(teamId: string, dto: AddMemberDTO): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(
      `${this.baseUrl}/${teamId}/members`,
      dto,
    );
  }

  respondToRequest(
    teamId: string,
    userId: string,
    status: UserTeamStatus,
  ): Observable<TeamResponse> {
    return this.http.patch<TeamResponse>(
      `${this.baseUrl}/${teamId}/members/${userId}/status`,
      { status },
    );
  }
}
