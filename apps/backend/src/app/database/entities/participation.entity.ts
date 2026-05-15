import { Participation, Team } from '@prisma/client';

export type ParticipationWithTeam = Participation & {
  team: Team;
};

export type LeaderboardRow = {
  teamId: string;
  finalScore: number;
  team: {
    name: string;
  };
}