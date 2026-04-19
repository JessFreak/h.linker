import { Prisma, Team, User, UserTeam } from '@prisma/client';

export type TeamWithMembers = Team & {
  members: (UserTeam & {
    user: User;
  })[];
};

export type UserInvitationWithTeam = Prisma.UserTeamGetPayload<{
  include: { team: true };
}>;