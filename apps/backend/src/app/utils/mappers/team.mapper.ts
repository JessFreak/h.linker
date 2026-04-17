import { TeamWithMembers } from '../../database/entities/team.entity';
import {
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
      };
    });

    const members = allMapped.filter((m) => m.status === 'ACCEPTED');
    const requests = allMapped.filter((m) => m.status === 'PENDING');

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      communicationLink: team.communicationLink,
      leaderId: team.leaderId,
      members,
      requests: requests.length > 0 ? requests : undefined,
    };
  }

  static getTeamsResponse(teams: TeamWithMembers[]): TeamsResponse {
    return {
      teams: teams.map((team) => this.getTeamResponse(team)),
    };
  }
}
