import { Prisma } from '@prisma/client';

export type ShowcaseParticipationData = Prisma.ParticipationGetPayload<{
  include: {
    team: {
      include: {
        members: {
          where: { status: 'ACCEPTED' };
        };
      };
    };
    hackathon: {
      include: {
        criteria: true;
      };
    };
  };
}>;
