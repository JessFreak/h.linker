import { TeamWithMembers } from '../../database/entities/team.entity';
import {
  TeamResponse,
  TeamsResponse,
  TeamMemberResponse,
} from '@h.linker/libs';
import { UserMapper } from './user.mapper';

export class TeamMapper {
  static getTeamResponse(team: TeamWithMembers): TeamResponse {
    if (!team) return null;
    const members: TeamMemberResponse[] = team.members.map((m) => {
      const userBase = UserMapper.getUserResponse(m.user);
      return {
        ...userBase,
        roleName: m.roleName,
        status: m.status,
        type: m.type,
      };
    });

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      communicationLink: team.communicationLink,
      leaderId: team.leaderId,
      members,
    };
  }

  static getTeamsResponse(teams: TeamWithMembers[]): TeamsResponse {
    return {
      teams: teams.map((team) => this.getTeamResponse(team)),
    };
  }
}
