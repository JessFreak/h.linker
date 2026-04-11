import { Hackathon } from './hackathon.response';
import { Team } from './team.response';

export class UserResponse {
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

export class UsersResponse {
  users: UserResponse[];
}

export class UserTeamResponse extends Team {
  userRole: string;
  status: string;
}

export class UserProjectResponse {
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

export class FullUserResponse extends UserResponse {
  createdHackathons: Hackathon[];
  teams: UserTeamResponse[];
  projects: UserProjectResponse[];
  githubInsights?: GitHubInsights | null;
}
