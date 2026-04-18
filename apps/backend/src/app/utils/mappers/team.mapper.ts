import { TeamWithMembers } from '../../database/entities/team.entity';
import {
  TeamMemberResponse,
  TeamResponse,
  TeamsResponse,
} from '@h.linker/libs';
import { UserMapper } from './user.mapper';

export class TeamMapper {
  static getTeamResponse(team: TeamWithMembers): TeamResponse {
    if (!team) return null;

    const allMapped = team.members.map((m) => {
      const userBase = UserMapper.getUserResponse(m.user);
      return {
        ...userBase,
        roleName: m.roleName,
        status: m.status,
        type: m.type,
        message: m.message,
      };
    });

    const { members, requests } = allMapped.reduce(
      (acc, m) => {
        if (m.status === 'ACCEPTED') {
          acc.members.push(m);
        } else {
          acc.requests.push(m);
        }
        return acc;
      },
      {
        members: [] as TeamMemberResponse[],
        requests: [] as TeamMemberResponse[],
      },
    );

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      communicationLink: team.communicationLink,
      leaderId: team.leaderId,
      members,
      requests,
    };
  }

  static getTeamsResponse(teams: TeamWithMembers[]): TeamsResponse {
    return {
      teams: teams.map((team) => this.getTeamResponse(team)),
    };
  }
}
