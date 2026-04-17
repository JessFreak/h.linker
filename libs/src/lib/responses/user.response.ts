import { Hackathon } from './hackathon.response';
import { TeamResponse } from './team.response';

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

export interface GitHubLanguage {
  name: string;
  percent: number;
}

export interface GitHubInsights {
  totalContributions: number;
  contributionTrend: string;
  totalStars: number;
  starredReposCount: number;
  publicReposCount: number;
  activeReposThisMonth: number;
  topLanguages: GitHubLanguage[];
}

export interface FullUserResponse extends UserResponse {
  createdHackathons: Hackathon[];
  teams: UserTeamResponse[];
  projects: UserProjectResponse[];
  githubInsights?: GitHubInsights | null;
}
