import { Test, TestingModule } from '@nestjs/testing';
import { TeamRepository } from './team.repository';
import { PrismaService } from '../prisma.service';
import { UserTeamStatus, UserTeamType } from '@prisma/client';
import { Paginator } from '../../utils/prisma-pagination.util';
import { BaseQueryDTO } from '@h.linker/libs';

jest.mock('../../utils/prisma-pagination.util', () => ({
  Paginator: {
    paginate: jest.fn(),
  },
}));

describe('TeamRepository', () => {
  let repository: TeamRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamRepository,
        {
          provide: PrismaService,
          useValue: {
            team: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            userTeam: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<TeamRepository>(TeamRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkExistsById', () => {
    it('should return true if team exists', async () => {
      (prismaService.team.findUnique as jest.Mock).mockResolvedValue({
        id: 't1',
      });

      const result = await repository.checkExistsById('t1');

      expect(prismaService.team.findUnique).toHaveBeenCalledWith({
        where: { id: 't1' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if team does not exist', async () => {
      (prismaService.team.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.checkExistsById('t1');

      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a team and automatically add the creator as Team Lead', async () => {
      const inputData = {
        name: 'Alpha Team',
        description: 'Best team',
        communicationLink: 'https://tg.me/team',
        leaderId: 'u1',
      } as any;

      const expectedTeam = { id: 't1', ...inputData };
      (prismaService.team.create as jest.Mock).mockResolvedValue(expectedTeam);

      const result = await repository.create(inputData);

      expect(prismaService.team.create).toHaveBeenCalledWith({
        data: {
          name: inputData.name,
          description: inputData.description,
          communicationLink: inputData.communicationLink,
          leaderId: inputData.leaderId,
          members: {
            create: {
              userId: inputData.leaderId,
              roleName: 'Team Lead',
              type: UserTeamType.REQUEST,
              status: UserTeamStatus.ACCEPTED,
            },
          },
        },
        include: repository['include'],
      });
      expect(result).toEqual(expectedTeam);
    });
  });

  describe('find', () => {
    it('should find teams based on where clause', async () => {
      const where = { name: 'Alpha' };
      const expectedTeams = [{ id: 't1', name: 'Alpha' }];
      (prismaService.team.findMany as jest.Mock).mockResolvedValue(
        expectedTeams,
      );

      const result = await repository.find(where);

      expect(prismaService.team.findMany).toHaveBeenCalledWith({
        where,
        include: repository['include'],
      });
      expect(result).toEqual(expectedTeams);
    });
  });

  describe('findAllPaged', () => {
    it('should call Paginator.paginate and execute callbacks', async () => {
      const query: BaseQueryDTO = { page: 1, take: 10, skip: 0 };
      const where = { leaderId: 'u1' };
      const orderBy = { name: 'asc' } as any;
      const expectedPageResponse = { items: [{ id: 't1' }], meta: {} };

      (Paginator.paginate as jest.Mock).mockImplementation(
        async (findManyCb, countCb, q) => {
          await findManyCb({ skip: 0, take: 10 });
          await countCb();
          return expectedPageResponse;
        },
      );

      const result = await repository.findAllPaged(query, where, orderBy);

      expect(prismaService.team.findMany).toHaveBeenCalledWith({
        where,
        orderBy,
        include: repository['include'],
        skip: 0,
        take: 10,
      });

      expect(prismaService.team.count).toHaveBeenCalledWith({ where });

      expect(result).toEqual(expectedPageResponse);
    });
  });

  describe('findById', () => {
    it('should return a team by id with relations included', async () => {
      const expectedTeam = { id: 't1' };
      (prismaService.team.findFirst as jest.Mock).mockResolvedValue(
        expectedTeam,
      );

      const result = await repository.findById('t1');

      expect(prismaService.team.findFirst).toHaveBeenCalledWith({
        where: { id: 't1' },
        include: repository['include'],
      });
      expect(result).toEqual(expectedTeam);
    });
  });

  describe('updateById', () => {
    it('should update team data', async () => {
      const updateData = { name: 'Beta Team' };
      const expectedTeam = { id: 't1', name: 'Beta Team' };
      (prismaService.team.update as jest.Mock).mockResolvedValue(expectedTeam);

      const result = await repository.updateById('t1', updateData as any);

      expect(prismaService.team.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: updateData,
        include: repository['include'],
      });
      expect(result).toEqual(expectedTeam);
    });
  });

  describe('deleteById', () => {
    it('should delete a team by id', async () => {
      await repository.deleteById('t1');

      expect(prismaService.team.delete).toHaveBeenCalledWith({
        where: { id: 't1' },
      });
    });
  });

  describe('findUserInvitations', () => {
    it('should return pending invitations for a specific user', async () => {
      const expectedInvitations = [{ id: 'inv1', team: { id: 't1' } }];
      (prismaService.userTeam.findMany as jest.Mock).mockResolvedValue(
        expectedInvitations,
      );

      const result = await repository.findUserInvitations('u1');

      expect(prismaService.userTeam.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'u1',
          type: UserTeamType.INVITATION,
          status: UserTeamStatus.PENDING,
        },
        include: {
          team: true,
        },
        orderBy: {
          created: 'desc',
        },
      });
      expect(result).toEqual(expectedInvitations);
    });
  });
});
