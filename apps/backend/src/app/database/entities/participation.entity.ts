import { Participation, Team } from '@prisma/client';

export type ParticipationWithTeam = Participation & {
  team: Team;
};
