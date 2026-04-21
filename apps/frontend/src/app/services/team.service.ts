import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TeamResponse,
  TeamsResponse,
  CreateTeamDTO,
  UpdateTeamDTO,
  JoinRequestDTO,
  InviteUserDTO,
  MemberStatus,
  UserInvitationsResponse,
} from '@h.linker/libs';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/teams';

  getAll(leaderId?: string): Observable<TeamsResponse> {
    let params = new HttpParams();

    if (leaderId) {
      params = params.set('leaderId', leaderId);
    }

    return this.http.get<TeamsResponse>(this.baseUrl, { params });
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
