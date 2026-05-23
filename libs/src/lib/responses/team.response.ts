import { UserResponse } from './user.response';
import { MemberStatus, MemberType } from '../dtos/member.dto';
import { CriterionScoreDetail } from './registration.response';

export interface TeamMemberResponse extends UserResponse {
  roleName: string;
  status: MemberStatus;
  type: MemberType;
  message: string;
  createdAt: Date;
}

export interface TeamParticipationResponse {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  hackathonSlug: string;
  hackathonStatus: string;
  projectTitle: string | null;
  projectDescription: string | null;
  githubRepoUrl: string | null;
  finalScore: number;
  criteriaScores?: CriterionScoreDetail[];
}

export interface TeamResponse {
  id: string;
  name: string;
  description: string | null;
  communicationLink: string | null;
  leaderId: string;
  members?: TeamMemberResponse[];
  requests?: TeamMemberResponse[];
  participations?: TeamParticipationResponse[];
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
