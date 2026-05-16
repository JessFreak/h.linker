import { Participation, Prisma, Team } from '@prisma/client';

export type ParticipationWithTeam = Participation & {
  team: Team;
};

export type ParticipationWithScoresAndReviews = Prisma.ParticipationGetPayload<{
  include: {
    team: true;
    reviews: {
      include: {
        jury: {
          include: {
            user: true;
          };
        };
      };
    };
    scores: {
      include: {
        criterion: true;
        jury: {
          include: {
            user: true;
          };
        };
      };
    };
  };
}>;

export type LeaderboardRow = {
  teamId: string;
  finalScore: number;
  team: {
    name: string;
  };
}