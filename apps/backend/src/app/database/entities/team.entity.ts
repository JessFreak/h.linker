import {
  Team,
  User,
  UserTeam,
  Participation,
  Hackathon,
  Prisma,
} from '@prisma/client';

export type FullTeam = Team & {
  members: (UserTeam & {
    user: User;
  })[];
  participations: (Participation & {
    hackathon: Hackathon;
  })[];
};

export type UserInvitationWithTeam = Prisma.UserTeamGetPayload<{
  include: { team: true };
}>;