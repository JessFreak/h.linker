import { FullUser, UserWithSkills } from '../../database/entities/user.entity';
import {
  FullUserResponse,
  UserTeamResponse,
  UserProjectResponse,
  UserResponse,
  UsersResponse,
} from '@h.linker/libs';

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
      id: m.team.id,
      name: m.team.name,
      description: m.team.description,
      communicationLink: m.team.communicationLink,
      leaderId: m.team.leaderId,
      userRole: m.roleName,
      status: m.status,
    }));

    const projects: UserProjectResponse[] = [];
    user.memberships.forEach((m) => {
      m.team.participations.forEach((p) => {
        projects.push({
          hackathonTitle: p.hackathon.title,
          repoUrl: p.githubRepoUrl,
          teamName: m.team.name,
          finalScore: p.finalScore,
        });
      });
    });

    return {
      ...base,
      createdHackathons: user.createdHackathons,
      teams,
      projects,
    };
  }
}
