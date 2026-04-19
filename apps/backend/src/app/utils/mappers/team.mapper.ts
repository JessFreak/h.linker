import {
  TeamWithMembers,
  UserInvitationWithTeam,
} from '../../database/entities/team.entity';
import {
  TeamMemberResponse,
  TeamResponse,
  TeamsResponse,
  UserInvitationResponse,
  UserInvitationsResponse,
  MemberStatus,
  MemberType,
} from '@h.linker/libs';
import { UserMapper } from './user.mapper';

export class TeamMapper {
  static getTeamResponse(team: TeamWithMembers): TeamResponse {
    if (!team) return null;

    const allMapped: TeamMemberResponse[] = team.members.map((m) => {
      const userBase = UserMapper.getUserResponse(m.user);
      return {
        ...userBase,
        roleName: m.roleName,
        status: m.status as MemberStatus,
        type: m.type as MemberType,
        message: m.message || '',
        createdAt: m.created,
      };
    });

    const { members, requests } = allMapped.reduce(
      (acc, m) => {
        if (m.status === MemberStatus.ACCEPTED) {
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

  static getInvitationResponse(
    inv: UserInvitationWithTeam,
  ): UserInvitationResponse {
    return {
      teamId: inv.teamId,
      teamName: inv.team.name,
      roleName: inv.roleName,
      message: inv.message || '',
      createdAt: inv.created,
    };
  }

  static getInvitationsResponse(
    invitations: UserInvitationWithTeam[],
  ): UserInvitationsResponse {
    return {
      invitations: invitations.map((inv) => this.getInvitationResponse(inv)),
    };
  }
}
