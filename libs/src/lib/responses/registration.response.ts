import { TeamResponse } from './team.response';

export interface UserRegistrationStatusResponse {
  isRegistered: boolean;
  team: TeamResponse | null;
  submission?: {
    title: string | null;
    description: string | null;
    repoUrl: string | null;
    finalScore: number | null;
  } | null;
}
