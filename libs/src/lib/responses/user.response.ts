import { TeamResponse } from './team.response';
import { HackathonResponse } from './hackathon.response';
import { GitHubInsights } from './github.response';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  githubUsername: string | null;
  firstName: string;
  lastName: string | null;
  githubId: string | null;
  bio: string | null;
  avatarUrl: string | null;
  skills: string[];
  matchPercentage?: number;
}

export interface UsersResponse {
  users: UserResponse[];
}

export interface UserTeamResponse extends TeamResponse {
  userRole: string;
}

export interface UserProjectResponse {
  hackathonTitle: string;
  repoUrl: string | null;
  teamName: string;
  finalScore: number;
}

export interface FullUserResponse extends UserResponse {
  createdHackathons: HackathonResponse[];
  teams: UserTeamResponse[];
  projects: UserProjectResponse[];
  githubInsights?: GitHubInsights | null;
}
