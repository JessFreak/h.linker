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

export class FullUserResponse extends UserResponse {
  createdHackathons: Hackathon[];
  teams: UserTeamResponse[];
  projects: UserProjectResponse[];
}
