import { UserTeamStatus, UserTeamType } from '@prisma/client';
import { UserResponse } from './user.response';

export interface TeamMemberResponse extends UserResponse {
  roleName: string;
  status: UserTeamStatus;
  type: UserTeamType;
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
