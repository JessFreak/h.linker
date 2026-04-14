import { Team, User, UserTeam } from '@prisma/client';

export type TeamWithMembers = Team & {
  members: (UserTeam & {
    user: User;
  })[];
};
