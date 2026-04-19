import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamRepository } from '../database/repositories/team.repository';
import {
  TeamWithMembers,
  UserInvitationWithTeam,
} from '../database/entities/team.entity';
import { MemberRepository } from '../database/repositories/member.repository';
import {
  CreateTeamDTO,
  InviteUserDTO,
  JoinRequestDTO,
  UpdateTeamDTO,
} from '@h.linker/libs';
import { Prisma, UserTeamStatus } from '@prisma/client';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async create(dto: CreateTeamDTO, leaderId: string): Promise<TeamWithMembers> {
    return this.teamRepository.create({ ...dto, leaderId });
  }

  async findById(id: string): Promise<TeamWithMembers> {
    return this.teamRepository.findById(id);
  }

  async findByUserId(userId: string): Promise<TeamWithMembers[]> {
    return this.teamRepository.find({ members: { some: { userId } } });
  }

  async getAll(leaderId?: string): Promise<TeamWithMembers[]> {
    const where: Prisma.TeamWhereInput = {};
    if (leaderId) {
      where.leaderId = leaderId;
    }

    return this.teamRepository.find(where);
  }

  async updateById(id: string, dto: UpdateTeamDTO): Promise<TeamWithMembers> {
    return this.teamRepository.updateById(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.teamRepository.deleteById(id);
  }

  async joinRequest(
    teamId: string,
    userId: string,
    dto: JoinRequestDTO,
  ): Promise<TeamWithMembers> {
    await this.validateConnection(teamId, userId);

    await this.memberRepository.upsertConnection({
      teamId,
      userId,
      roleName: dto.roleName,
      message: dto.message,
      type: 'REQUEST',
      status: 'PENDING',
    });

    return this.teamRepository.findById(teamId);
  }

  async inviteUser(
    teamId: string,
    dto: InviteUserDTO,
  ): Promise<TeamWithMembers> {
    await this.validateConnection(teamId, dto.userId);

    await this.memberRepository.upsertConnection({
      teamId,
      userId: dto.userId,
      roleName: dto.roleName,
      message: dto.message,
      type: 'INVITATION',
      status: 'PENDING',
    });

    return this.teamRepository.findById(teamId);
  }

  private async validateConnection(teamId: string, userId: string) {
    const existing = await this.memberRepository.findConnection(teamId, userId);

    if (existing?.status === 'ACCEPTED') {
      throw new BadRequestException('User is already a member of this team');
    }

    if (existing?.status === 'PENDING') {
      throw new BadRequestException(
        'There is already a pending request/invitation',
      );
    }
  }

  async removeMember(teamId: string, userId: string): Promise<TeamWithMembers> {
    await this.memberRepository.removeMember(teamId, userId);

    return this.teamRepository.findById(teamId);
  }

  async respondToMemberRequest(
    teamId: string,
    userId: string,
    status: UserTeamStatus,
  ): Promise<TeamWithMembers> {
    const membership = await this.memberRepository.findMember(teamId, userId);

    if (!membership) {
      throw new NotFoundException('Membership request not found');
    }

    if (membership.status !== UserTeamStatus.PENDING) {
      throw new BadRequestException(
        `Cannot change status from ${membership.status} to ${status}`,
      );
    }

    await this.memberRepository.updateMemberStatus(teamId, userId, status);

    return this.teamRepository.findById(teamId);
  }

  async changeLeader(
    id: string,
    newLeaderId: string,
  ): Promise<TeamWithMembers> {
    return this.teamRepository.updateById(id, { leaderId: newLeaderId });
  }

  async findUserInvitations(userId: string): Promise<UserInvitationWithTeam[]> {
    return this.teamRepository.findUserInvitations(userId);
  }
}
