import {
  Hackathon,
  Participation,
  Team,
  User,
  UserCategory,
  UserTeam,
} from '@prisma/client';

export type UserWithSkills = User & {
  skills?: UserCategory[];
};

export type FullUser = UserWithSkills & {
  createdHackathons: Hackathon[];
  memberships: (UserTeam & {
    team: Team & {
      participations: (Participation & {
        hackathon: Hackathon;
      })[];
    };
  })[];
};
