import { FullUser, UserWithSkills } from '../../database/entities/user.entity';
import {
  FullUserResponse,
  UserTeamResponse,
  UserProjectResponse,
  UserResponse,
  UsersResponse,
} from '@h.linker/libs';
import { HackathonMapper } from './hackathon.mapper';

export class UserMapper {
  static getUserResponse(user: UserWithSkills): UserResponse {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      githubId: user.githubId,
      githubUsername: user.githubUsername,
      skills: user.skills?.map((uc) => uc.category) || [],
    };
  }

  static getUsersResponse(users: UserWithSkills[]): UsersResponse {
    return {
      users: users.map((user) => this.getUserResponse(user)),
    };
  }

  static getFullUserResponse(user: FullUser): FullUserResponse {
    const base = this.getUserResponse(user);

    const teams: UserTeamResponse[] = user.memberships.map((m) => ({
      ...m.team,
      userRole: m.roleName,
    }));

    const projects: UserProjectResponse[] = user.memberships.flatMap((m) =>
      m.team.participations.map((p) => ({
        hackathonTitle: p.hackathon.title,
        repoUrl: p.githubRepoUrl,
        teamName: m.team.name,
        finalScore: p.finalScore,
      })),
    );

    const createdHackathons = user.createdHackathons.map((h) =>
      HackathonMapper.mapBasicInfo(h),
    );

    return {
      ...base,
      createdHackathons,
      teams,
      projects,
    };
  }
}
