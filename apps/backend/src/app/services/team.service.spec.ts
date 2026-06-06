import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { TeamRepository } from '../database/repositories/team.repository';
import { MemberRepository } from '../database/repositories/member.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserTeamStatus } from '@prisma/client';

describe('TeamService', () => {
  let service: TeamService;
  let teamRepo: TeamRepository;
  let memberRepo: MemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: TeamRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findAllPaged: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
            findUserInvitations: jest.fn(),
          },
        },
        {
          provide: MemberRepository,
          useValue: {
            upsertConnection: jest.fn(),
            findConnection: jest.fn(),
            removeMember: jest.fn(),
            findMember: jest.fn(),
            updateMemberStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    teamRepo = module.get<TeamRepository>(TeamRepository);
    memberRepo = module.get<MemberRepository>(MemberRepository);
  });

  it('create: should call repo create with leaderId', async () => {
    await service.create({ name: 'Team1' } as any, 'leader1');
    expect(teamRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Team1', leaderId: 'leader1' }),
    );
  });

  it('findById: should call repo findById', async () => {
    await service.findById('t1');
    expect(teamRepo.findById).toHaveBeenCalledWith('t1');
  });

  it('updateById: should call repo updateById', async () => {
    await service.updateById('t1', { name: 'Updated' });
    expect(teamRepo.updateById).toHaveBeenCalledWith('t1', { name: 'Updated' });
  });

  it('delete: should call repo deleteById', async () => {
    await service.delete('t1');
    expect(teamRepo.deleteById).toHaveBeenCalledWith('t1');
  });

  it('joinRequest: should validate connection and upsert request', async () => {
    (memberRepo.findConnection as jest.Mock).mockResolvedValue(null);
    (teamRepo.findById as jest.Mock).mockResolvedValue({ id: 't1' });

    await service.joinRequest('t1', 'u1', {
      roleName: 'Dev',
      message: 'Join us',
    } as any);

    expect(memberRepo.upsertConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        teamId: 't1',
        userId: 'u1',
        roleName: 'Dev',
        message: 'Join us',
        type: 'REQUEST',
        status: 'PENDING',
      }),
    );
    expect(teamRepo.findById).toHaveBeenCalledWith('t1');
  });

  it('inviteUser: should validate connection and upsert invitation', async () => {
    (memberRepo.findConnection as jest.Mock).mockResolvedValue(null);
    (teamRepo.findById as jest.Mock).mockResolvedValue({ id: 't1' });

    await service.inviteUser('t1', {
      userId: 'u2',
      roleName: 'PM',
      message: 'Join project',
    } as any);

    expect(memberRepo.upsertConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        teamId: 't1',
        userId: 'u2',
        roleName: 'PM',
        message: 'Join project',
        type: 'INVITATION',
        status: 'PENDING',
      }),
    );
    expect(teamRepo.findById).toHaveBeenCalledWith('t1');
  });

  it('validateConnection: should throw if user is already member (ACCEPTED)', async () => {
    (memberRepo.findConnection as jest.Mock).mockResolvedValue({
      status: 'ACCEPTED',
    });
    await expect(service['validateConnection']('t1', 'u1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('validateConnection: should throw if request is pending (PENDING)', async () => {
    (memberRepo.findConnection as jest.Mock).mockResolvedValue({
      status: 'PENDING',
    });
    await expect(service['validateConnection']('t1', 'u1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('validateConnection: should pass if no existing connection', async () => {
    (memberRepo.findConnection as jest.Mock).mockResolvedValue(null);
    await expect(
      service['validateConnection']('t1', 'u1'),
    ).resolves.not.toThrow();
  });

  it('removeMember: should remove member and return updated team', async () => {
    (teamRepo.findById as jest.Mock).mockResolvedValue({
      id: 't1',
      name: 'Team1',
    });
    await service.removeMember('t1', 'u1');
    expect(memberRepo.removeMember).toHaveBeenCalledWith('t1', 'u1');
    expect(teamRepo.findById).toHaveBeenCalledWith('t1');
  });

  it('respondToMemberRequest: should throw NotFoundException if membership not found', async () => {
    (memberRepo.findMember as jest.Mock).mockResolvedValue(null);
    await expect(
      service.respondToMemberRequest('t1', 'u1', UserTeamStatus.ACCEPTED),
    ).rejects.toThrow(NotFoundException);
  });

  it('respondToMemberRequest: should throw BadRequestException if status not PENDING', async () => {
    (memberRepo.findMember as jest.Mock).mockResolvedValue({
      status: UserTeamStatus.ACCEPTED,
    });
    await expect(
      service.respondToMemberRequest('t1', 'u1', UserTeamStatus.REJECTED),
    ).rejects.toThrow(BadRequestException);
  });

  it('respondToMemberRequest: should update status if membership is PENDING', async () => {
    (memberRepo.findMember as jest.Mock).mockResolvedValue({
      status: UserTeamStatus.PENDING,
    });
    (teamRepo.findById as jest.Mock).mockResolvedValue({
      id: 't1',
      name: 'Team1',
    });

    await service.respondToMemberRequest('t1', 'u1', UserTeamStatus.ACCEPTED);

    expect(memberRepo.updateMemberStatus).toHaveBeenCalledWith(
      't1',
      'u1',
      UserTeamStatus.ACCEPTED,
    );
    expect(teamRepo.findById).toHaveBeenCalledWith('t1');
  });

  it('changeLeader: should update leaderId', async () => {
    await service.changeLeader('t1', 'newLeader');
    expect(teamRepo.updateById).toHaveBeenCalledWith('t1', {
      leaderId: 'newLeader',
    });
  });

  it('findUserInvitations: should call repository method', async () => {
    await service.findUserInvitations('u1');
    expect(teamRepo.findUserInvitations).toHaveBeenCalledWith('u1');
  });

  it('getAll: should call findAllPaged with filters', async () => {
    const query = { search: 'Team', hackathonId: 'h1' } as any;
    await service.getAll(query);
    expect(teamRepo.findAllPaged).toHaveBeenCalledWith(
      query,
      expect.objectContaining({
        participations: { some: { hackathonId: 'h1' } },
        OR: expect.any(Array),
      }),
      expect.anything(),
    );
  });

  it('getAll: should include leaderId and memberId filters', async () => {
    const query = { leaderId: 'l1', memberId: 'm1' } as any;
    await service.getAll(query);
    expect(teamRepo.findAllPaged).toHaveBeenCalledWith(
      query,
      expect.objectContaining({
        leaderId: 'l1',
        members: { some: { userId: 'm1', status: 'ACCEPTED' } },
      }),
      expect.anything(),
    );
  });

  it('getAll: should default order to asc when not provided', async () => {
    const query = { search: 'test' } as any;
    await service.getAll(query);
    expect(teamRepo.findAllPaged).toHaveBeenCalledWith(
      query,
      expect.any(Object),
      expect.objectContaining({ name: 'asc' }),
    );
  });

  it('getAll: should handle empty query gracefully', async () => {
    const query = {} as any;
    await service.getAll(query);
    expect(teamRepo.findAllPaged).toHaveBeenCalledWith(
      query,
      expect.any(Object),
      expect.objectContaining({ name: 'asc' }),
    );
  });

  it('getAll: should include search filter when provided', async () => {
    const query = { search: 'Hack' } as any;
    await service.getAll(query);
    expect(teamRepo.findAllPaged).toHaveBeenCalledWith(
      query,
      expect.objectContaining({
        OR: [
          expect.objectContaining({ name: expect.any(Object) }),
          expect.objectContaining({ description: expect.any(Object) }),
        ],
      }),
      expect.anything(),
    );
  });

  it('validateConnection: should handle undefined status safely', async () => {
    (memberRepo.findConnection as jest.Mock).mockResolvedValue({});
    await expect(
      service['validateConnection']('t1', 'u1'),
    ).resolves.not.toThrow();
  });

  it('respondToMemberRequest: should handle unexpected status values gracefully', async () => {
    (memberRepo.findMember as jest.Mock).mockResolvedValue({
      status: 'UNKNOWN',
    });
    await expect(
      service.respondToMemberRequest('t1', 'u1', UserTeamStatus.ACCEPTED),
    ).rejects.toThrow(BadRequestException);
  });

  it('removeMember: should handle missing team gracefully', async () => {
    (teamRepo.findById as jest.Mock).mockResolvedValue(null);
    await service.removeMember('t1', 'u1');
    expect(memberRepo.removeMember).toHaveBeenCalledWith('t1', 'u1');
    expect(teamRepo.findById).toHaveBeenCalledWith('t1');
  });

  it('inviteUser: should throw if validateConnection fails', async () => {
    (memberRepo.findConnection as jest.Mock).mockResolvedValue({
      status: 'ACCEPTED',
    });
    await expect(
      service.inviteUser('t1', {
        userId: 'u1',
        roleName: 'Dev',
        message: 'Join',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('joinRequest: should throw if validateConnection fails', async () => {
    (memberRepo.findConnection as jest.Mock).mockResolvedValue({
      status: 'PENDING',
    });
    await expect(
      service.joinRequest('t1', 'u1', {
        roleName: 'Dev',
        message: 'Join',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('changeLeader: should handle empty leaderId gracefully', async () => {
    await service.changeLeader('t1', '');
    expect(teamRepo.updateById).toHaveBeenCalledWith('t1', { leaderId: '' });
  });

  it('findUserInvitations: should handle empty userId gracefully', async () => {
    await service.findUserInvitations('');
    expect(teamRepo.findUserInvitations).toHaveBeenCalledWith('');
  });
});

