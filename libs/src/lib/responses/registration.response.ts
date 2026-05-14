import { TeamResponse } from './team.response';

export interface UserRegistrationStatusResponse {
  isRegistered: boolean;
  team: TeamResponse | null;
}
