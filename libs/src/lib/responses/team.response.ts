import { UserResponse } from './user.response';
import { MemberStatus, MemberType } from '../dtos/member.dto';

export interface TeamMemberResponse extends UserResponse {
  roleName: string;
  status: MemberStatus;
  type: MemberType;
  message: string;
  createdAt: Date;
}

export interface TeamResponse {
  id: string;
  name: string;
  description: string | null;
  communicationLink: string | null;
  leaderId: string;
  members?: TeamMemberResponse[];
  requests?: TeamMemberResponse[];
}

export interface TeamsResponse {
  teams: TeamResponse[];
}

export interface UserInvitationResponse {
  teamId: string;
  teamName: string;
  roleName: string;
  message?: string;
  createdAt: Date;
}

export interface UserInvitationsResponse {
  invitations: UserInvitationResponse[];
}
