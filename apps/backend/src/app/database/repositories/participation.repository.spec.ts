import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationRepository } from './participation.repository';
import { PrismaService } from '../prisma.service';
import { UserTeamStatus } from '@prisma/client';
import { BaseQueryDTO, Order } from '@h.linker/libs';

describe('ParticipationRepository', () => {
  let repository: ParticipationRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationRepository,
        {
          provide: PrismaService,
          useValue: {
            participation: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            review: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<ParticipationRepository>(ParticipationRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserParticipation', () => {
    it('should find first participation by hackathonId and userId', async () => {
      const expectedResult = { id: 'p1', teamId: 't1' };
      (prismaService.participation.findFirst as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await repository.findUserParticipation('h1', 'u1');

      expect(prismaService.participation.findFirst).toHaveBeenCalledWith({
        where: {
          hackathonId: 'h1',
          team: {
            members: {
              some: { userId: 'u1', status: UserTeamStatus.ACCEPTED },
            },
          },
        },
        include: {
          team: true,
          scores: { include: { criterion: true } },
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('checkExistsById', () => {
    it('should return true if participation exists', async () => {
      (prismaService.participation.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
      });
      const result = await repository.checkExistsById('p1');
      expect(prismaService.participation.findUnique).toHaveBeenCalledWith({
        where: { id: 'p1' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if participation does not exist', async () => {
      (prismaService.participation.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      const result = await repository.checkExistsById('p1');
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a participation', async () => {
      await repository.create('h1', 't1');
      expect(prismaService.participation.create).toHaveBeenCalledWith({
        data: { hackathonId: 'h1', teamId: 't1' },
      });
    });
  });

  describe('findByTeamAndHackathon', () => {
    it('should find participation by team and hackathon', async () => {
      const expectedResult = { id: 'p1' };
      (prismaService.participation.findUnique as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await repository.findByTeamAndHackathon('h1', 't1');

      expect(prismaService.participation.findUnique).toHaveBeenCalledWith({
        where: { teamId_hackathonId: { teamId: 't1', hackathonId: 'h1' } },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateSubmission', () => {
    it('should update participation submission data', async () => {
      const updateData = { githubRepoUrl: 'http://github.com/test' };
      await repository.updateSubmission('h1', 't1', updateData);

      expect(prismaService.participation.update).toHaveBeenCalledWith({
        where: { teamId_hackathonId: { teamId: 't1', hackathonId: 'h1' } },
        data: updateData,
      });
    });
  });

  describe('findAllSubmissionsByHackathonId', () => {
    it('should return participations with githubRepoUrl', async () => {
      const expectedResult = [{ id: 'p1' }];
      (prismaService.participation.findMany as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await repository.findAllSubmissionsByHackathonId('h1');

      expect(prismaService.participation.findMany).toHaveBeenCalledWith({
        where: { hackathonId: 'h1', githubRepoUrl: { not: null } },
        include: {
          team: true,
          reviews: { include: { jury: { include: { user: true } } } },
          scores: {
            include: { criterion: true, jury: { include: { user: true } } },
          },
        },
        orderBy: { updatedAt: 'asc' },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getLeaderboardData', () => {
    it('should return leaderboard data ordered by finalScore', async () => {
      const expectedResult = [{ teamId: 't1', finalScore: 100 }];
      (prismaService.participation.findMany as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await repository.getLeaderboardData('h1');

      expect(prismaService.participation.findMany).toHaveBeenCalledWith({
        where: { hackathonId: 'h1' },
        select: expect.any(Object),
        orderBy: { finalScore: 'desc' },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findReviewsByMember', () => {
    it('should return reviews for a team member', async () => {
      const expectedResult = [{ id: 'r1' }];
      (prismaService.review.findMany as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await repository.findReviewsByMember('h1', 'u1');

      expect(prismaService.review.findMany).toHaveBeenCalledWith({
        where: {
          participation: {
            hackathonId: 'h1',
            team: {
              members: {
                some: { userId: 'u1', status: UserTeamStatus.ACCEPTED },
              },
            },
          },
        },
        include: { jury: { include: { user: true } } },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findShowcasePagedByPercentage', () => {
    it('should calculate percentages, sort desc, and return paginated raw data', async () => {
      // Додано skip, щоб задовольнити BaseQueryDTO
      const query: BaseQueryDTO = { skip: 0 };
      const where = { hackathonId: 'h1' };

      // Перший виклик: lightweightParticipations
      (prismaService.participation.findMany as jest.Mock).mockResolvedValueOnce(
        [
          {
            id: 'p1',
            finalScore: 50,
            hackathon: { criteria: [{ weight: 100, maxValue: 100 }] },
          },
          {
            id: 'p2',
            finalScore: 90,
            hackathon: { criteria: [{ weight: 100, maxValue: 100 }] },
          },
          {
            id: 'p3',
            finalScore: 0,
            hackathon: { criteria: [] },
          },
        ],
      );

      // Другий виклик: rawData
      (prismaService.participation.findMany as jest.Mock).mockResolvedValueOnce(
        [
          { id: 'p2', data: 'raw2' },
          { id: 'p1', data: 'raw1' },
        ],
      );

      const result = await repository.findShowcasePagedByPercentage(
        query,
        where,
      );

      expect(prismaService.participation.findMany).toHaveBeenNthCalledWith(1, {
        where,
        select: expect.any(Object),
      });

      expect(prismaService.participation.findMany).toHaveBeenNthCalledWith(2, {
        where: { id: { in: ['p2', 'p1', 'p3'] } },
        include: repository['showcaseInclude'],
      });

      // PageResponse зазвичай має властивість .data (змінено з .items)
      expect(result.data).toEqual([
        { id: 'p2', data: 'raw2' },
        { id: 'p1', data: 'raw1' },
      ]);
      expect(result.meta.itemCount).toBe(3);
    });

    it('should sort ascending and respect custom pagination', async () => {
      const query: BaseQueryDTO = {
        order: Order.ASC,
        page: 2,
        take: 1,
        skip: 0,
      };
      const where = {};

      (prismaService.participation.findMany as jest.Mock).mockResolvedValueOnce(
        [
          {
            id: 'p1',
            finalScore: 10,
            hackathon: { criteria: [{ weight: 100, maxValue: 10 }] },
          },
          {
            id: 'p2',
            finalScore: 5,
            hackathon: { criteria: [{ weight: 100, maxValue: 10 }] },
          },
          {
            id: 'p3',
            finalScore: 1,
            hackathon: { criteria: [{ weight: 100, maxValue: 10 }] },
          },
        ],
      );

      (prismaService.participation.findMany as jest.Mock).mockResolvedValueOnce(
        [{ id: 'p2', data: 'raw2' }],
      );

      await repository.findShowcasePagedByPercentage(query, where);

      expect(prismaService.participation.findMany).toHaveBeenNthCalledWith(2, {
        where: { id: { in: ['p2'] } },
        include: repository['showcaseInclude'],
      });
    });
  });
});
