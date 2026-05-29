import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TeamResponse,
  CreateTeamDTO,
  UpdateTeamDTO,
  JoinRequestDTO,
  InviteUserDTO,
  MemberStatus,
  UserInvitationsResponse,
  TeamQueryDTO,
  PageResponse,
} from '@h.linker/libs';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/teams';

  getAll(
    query: Partial<TeamQueryDTO> = {},
  ): Observable<PageResponse<TeamResponse>> {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            params = params.append(key, v.toString());
          });
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return this.http.get<PageResponse<TeamResponse>>(this.baseUrl, { params });
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

  applyToTeam(teamId: string, dto: JoinRequestDTO): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(`${this.baseUrl}/${teamId}/apply`, dto);
  }

  inviteUser(teamId: string, dto: InviteUserDTO): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(
      `${this.baseUrl}/${teamId}/invite`,
      dto,
    );
  }

  respondToRequest(
    teamId: string,
    userId: string,
    status: MemberStatus,
  ): Observable<TeamResponse> {
    return this.http.patch<TeamResponse>(
      `${this.baseUrl}/${teamId}/members/${userId}/status`,
      { status },
    );
  }

  leave(teamId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${teamId}/leave`);
  }

  getMyInvitations(): Observable<UserInvitationsResponse> {
    return this.http.get<UserInvitationsResponse>(
      `${this.baseUrl}/invitations`,
    );
  }

  changeLeader(teamId: string, newLeaderId: string): Observable<TeamResponse> {
    return this.http.patch<TeamResponse>(
      `${this.baseUrl}/${teamId}/leader`,
      {},
      { params: { newLeaderId } },
    );
  }

  removeMember(teamId: string, userId: string): Observable<TeamResponse> {
    return this.http.delete<TeamResponse>(
      `${this.baseUrl}/${teamId}/members/${userId}`,
    );
  }
}
