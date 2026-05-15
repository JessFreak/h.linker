import {
  FullTeam,
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
import { ParticipationMapper } from './participation.mapper';
import { Team } from '@prisma/client';

export class TeamMapper {
  static getDetailResponse(team: Team): TeamResponse {
    return {
      id: team.id,
      name: team.name,
      leaderId: team.leaderId,
      description: team.description || null,
      communicationLink: team.communicationLink || null,
    };
  }

  static getTeamResponse(team: FullTeam): TeamResponse {
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
      ...this.getDetailResponse(team),
      members,
      requests,
      participations: ParticipationMapper.getTeamParticipationsListResponse(
        team.participations,
      ),
    };
  }

  static getTeamsResponse(teams: FullTeam[]): TeamsResponse {
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
