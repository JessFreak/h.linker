import { Test, TestingModule } from '@nestjs/testing';
import { MemberRepository } from './member.repository';
import { PrismaService } from '../prisma.service';
import { UserTeamStatus, UserTeamType } from '@prisma/client';

describe('MemberRepository', () => {
  let repository: MemberRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberRepository,
        {
          provide: PrismaService,
          useValue: {
            userTeam: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
              delete: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<MemberRepository>(MemberRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findMember', () => {
    it('should find a member by teamId and userId', async () => {
      const mockUserTeam = { userId: 'u1', teamId: 't1', status: 'ACCEPTED' };
      (prismaService.userTeam.findUnique as jest.Mock).mockResolvedValue(
        mockUserTeam,
      );

      const result = await repository.findMember('t1', 'u1');

      expect(prismaService.userTeam.findUnique).toHaveBeenCalledWith({
        where: {
          userId_teamId: { userId: 'u1', teamId: 't1' },
        },
      });
      expect(result).toEqual(mockUserTeam);
    });
  });

  describe('findConnection', () => {
    it('should find a connection by teamId and userId', async () => {
      const mockUserTeam = { userId: 'u1', teamId: 't1', status: 'PENDING' };
      (prismaService.userTeam.findUnique as jest.Mock).mockResolvedValue(
        mockUserTeam,
      );

      const result = await repository.findConnection('t1', 'u1');

      expect(prismaService.userTeam.findUnique).toHaveBeenCalledWith({
        where: {
          userId_teamId: { userId: 'u1', teamId: 't1' },
        },
      });
      expect(result).toEqual(mockUserTeam);
    });
  });

  describe('upsertConnection', () => {
    it('should upsert a connection with correctly mapped data and new Date for created', async () => {
      const inputData = {
        userId: 'u1',
        teamId: 't1',
        status: UserTeamStatus.PENDING,
        roleName: 'Developer',
        message: 'Hello',
        type: 'REQUEST' as UserTeamType,
      };

      const mockResult = { ...inputData, created: new Date() };
      (prismaService.userTeam.upsert as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await repository.upsertConnection(inputData as any);

      expect(prismaService.userTeam.upsert).toHaveBeenCalledWith({
        where: {
          userId_teamId: { userId: 'u1', teamId: 't1' },
        },
        update: {
          status: inputData.status,
          roleName: inputData.roleName,
          message: inputData.message,
          type: inputData.type,
          created: expect.any(Date),
        },
        create: inputData,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeMember', () => {
    it('should delete a member connection', async () => {
      await repository.removeMember('t1', 'u1');

      expect(prismaService.userTeam.delete).toHaveBeenCalledWith({
        where: {
          userId_teamId: { userId: 'u1', teamId: 't1' },
        },
      });
    });
  });

  describe('updateMemberStatus', () => {
    it('should update the status of a member connection', async () => {
      const mockUserTeam = {
        userId: 'u1',
        teamId: 't1',
        status: UserTeamStatus.ACCEPTED,
      };
      (prismaService.userTeam.update as jest.Mock).mockResolvedValue(
        mockUserTeam,
      );

      const result = await repository.updateMemberStatus(
        't1',
        'u1',
        UserTeamStatus.ACCEPTED,
      );

      expect(prismaService.userTeam.update).toHaveBeenCalledWith({
        where: {
          userId_teamId: { userId: 'u1', teamId: 't1' },
        },
        data: { status: UserTeamStatus.ACCEPTED },
      });
      expect(result).toEqual(mockUserTeam);
    });
  });
});
