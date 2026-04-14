import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamRepository } from '../database/repositories/team.repository';
import { TeamWithMembers } from '../database/entities/team.entity';
import { MemberRepository } from '../database/repositories/member.repository';
import { AlreadyExistsException } from '../utils/exceptions/already-exists.exception';
import {
  AddMemberDTO,
  CreateTeamDTO,
  UpdateTeamDTO,
} from '@h.linker/libs';
import { UserTeamStatus, UserTeamType } from '@prisma/client';

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

  async getAll(): Promise<TeamWithMembers[]> {
    return this.teamRepository.find({});
  }

  async updateById(id: string, dto: UpdateTeamDTO): Promise<TeamWithMembers> {
    return this.teamRepository.updateById(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.teamRepository.deleteById(id);
  }

  async addMember(teamId: string, dto: AddMemberDTO): Promise<TeamWithMembers> {
    const exists = await this.memberRepository.findMember(teamId, dto.userId);

    if (exists) {
      throw new AlreadyExistsException('Member', 'userId');
    }

    await this.memberRepository.addMember({
      teamId,
      userId: dto.userId,
      roleName: dto.roleName,
      type: UserTeamType.REQUEST,
    });

    return this.teamRepository.findById(teamId);
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
}
