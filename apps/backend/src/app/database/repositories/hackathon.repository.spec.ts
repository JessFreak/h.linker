import { Test, TestingModule } from '@nestjs/testing';
import { HackathonRepository } from './hackathon.repository';
import { PrismaService } from '../prisma.service';
import { Paginator } from '../../utils/prisma-pagination.util';
import { HackathonStatus } from '@prisma/client';

jest.mock('../../utils/prisma-pagination.util', () => ({
  Paginator: {
    paginate: jest.fn(),
  },
}));

describe('HackathonRepository', () => {
  let repository: HackathonRepository;
  let prismaService: PrismaService;

  const mockHackathon = {
    id: 'hack-1',
    title: 'Test Hackathon',
    creatorId: 'user-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackathonRepository,
        {
          provide: PrismaService,
          useValue: {
            hackathon: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<HackathonRepository>(HackathonRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a hackathon with full include', async () => {
      const data = { title: 'New Hackathon' } as any;
      (prismaService.hackathon.create as jest.Mock).mockResolvedValue(
        mockHackathon,
      );

      const result = await repository.create(data);

      expect(prismaService.hackathon.create).toHaveBeenCalledWith({
        data,
        include: repository['hackathonFullInclude'],
      });
      expect(result).toEqual(mockHackathon);
    });
  });

  describe('findAllPaged', () => {
    it('should call Paginator.paginate with correct arguments', async () => {
      const query = { page: 1, limit: 10 } as any;
      const where = { status: 'ACTIVE' } as any;
      const orderBy = { createdAt: 'desc' } as any;
      const expectedPageResponse = { items: [mockHackathon], meta: {} };

      (Paginator.paginate as jest.Mock).mockImplementation(
        async (findManyCb, countCb, q) => {
          await findManyCb({ skip: 0, take: 10 });
          await countCb();
          return expectedPageResponse;
        },
      );

      const result = await repository.findAllPaged(query, where, orderBy);

      expect(prismaService.hackathon.findMany).toHaveBeenCalledWith({
        where,
        orderBy,
        include: repository['hackathonFullInclude'],
        skip: 0,
        take: 10,
      });

      expect(prismaService.hackathon.count).toHaveBeenCalledWith({ where });

      expect(result).toEqual(expectedPageResponse);
    });
  });

  describe('getAll', () => {
    it('should return all hackathons with full include', async () => {
      (prismaService.hackathon.findMany as jest.Mock).mockResolvedValue([
        mockHackathon,
      ]);

      const result = await repository.getAll();

      expect(prismaService.hackathon.findMany).toHaveBeenCalledWith({
        include: repository['hackathonFullInclude'],
      });
      expect(result).toEqual([mockHackathon]);
    });
  });

  describe('checkExistsById', () => {
    it('should return true if hackathon exists', async () => {
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue({
        id: 'hack-1',
      });

      const result = await repository.checkExistsById('hack-1');

      expect(prismaService.hackathon.findUnique).toHaveBeenCalledWith({
        where: { id: 'hack-1' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if hackathon does not exist', async () => {
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.checkExistsById('unknown');

      expect(result).toBe(false);
    });
  });

  describe('checkExistsBySlug', () => {
    it('should return true if hackathon exists by slug', async () => {
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue({
        id: 'hack-1',
      });

      const result = await repository.checkExistsBySlug('my-slug');

      expect(prismaService.hackathon.findUnique).toHaveBeenCalledWith({
        where: { slug: 'my-slug' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if hackathon does not exist by slug', async () => {
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.checkExistsBySlug('unknown');

      expect(result).toBe(false);
    });
  });

  describe('getById', () => {
    it('should return hackathon by id with full include', async () => {
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue(
        mockHackathon,
      );

      const result = await repository.getById('hack-1');

      expect(prismaService.hackathon.findUnique).toHaveBeenCalledWith({
        where: { id: 'hack-1' },
        include: repository['hackathonFullInclude'],
      });
      expect(result).toEqual(mockHackathon);
    });
  });

  describe('getBySlug', () => {
    it('should return hackathon by slug with full include', async () => {
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue(
        mockHackathon,
      );

      const result = await repository.getBySlug('my-slug');

      expect(prismaService.hackathon.findUnique).toHaveBeenCalledWith({
        where: { slug: 'my-slug' },
        include: repository['hackathonFullInclude'],
      });
      expect(result).toEqual(mockHackathon);
    });
  });

  describe('updateById', () => {
    it('should update hackathon by id', async () => {
      const data = { title: 'Updated' } as any;
      (prismaService.hackathon.update as jest.Mock).mockResolvedValue(
        mockHackathon,
      );

      const result = await repository.updateById('hack-1', data);

      expect(prismaService.hackathon.update).toHaveBeenCalledWith({
        data,
        where: { id: 'hack-1' },
        include: repository['hackathonFullInclude'],
      });
      expect(result).toEqual(mockHackathon);
    });
  });

  describe('updateToActive', () => {
    it('should update hackathons to ACTIVE status based on start date', async () => {
      const currentTime = new Date();
      const mockUpdateResult = { count: 3 };

      (prismaService.hackathon.updateMany as jest.Mock).mockResolvedValue(
        mockUpdateResult,
      );

      const result = await repository.updateToActive(currentTime);

      expect(prismaService.hackathon.updateMany).toHaveBeenCalledWith({
        where: {
          status: HackathonStatus.REGISTRATION,
          startDate: { lte: currentTime },
        },
        data: {
          status: HackathonStatus.ACTIVE,
        },
      });
      expect(result).toEqual(mockUpdateResult);
    });
  });

  describe('updateToFinished', () => {
    it('should update hackathons to FINISHED status based on end date', async () => {
      const currentTime = new Date();
      const mockUpdateResult = { count: 2 };

      (prismaService.hackathon.updateMany as jest.Mock).mockResolvedValue(
        mockUpdateResult,
      );

      const result = await repository.updateToFinished(currentTime);

      expect(prismaService.hackathon.updateMany).toHaveBeenCalledWith({
        where: {
          status: HackathonStatus.ACTIVE,
          endDate: { lte: currentTime },
        },
        data: {
          status: HackathonStatus.FINISHED,
        },
      });
      expect(result).toEqual(mockUpdateResult);
    });
  });

  describe('isCreator', () => {
    it('should return true if user is the creator', async () => {
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue({
        creatorId: 'user-1',
      });

      const result = await repository.isCreator('hack-1', 'user-1');

      expect(prismaService.hackathon.findUnique).toHaveBeenCalledWith({
        where: { id: 'hack-1' },
        select: { creatorId: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if user is not the creator', async () => {
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue({
        creatorId: 'user-2',
      });

      const result = await repository.isCreator('hack-1', 'user-1');

      expect(result).toBe(false);
    });

    it('should return false if hackathon is not found', async () => {
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.isCreator('unknown', 'user-1');

      expect(result).toBe(false);
    });
  });

  describe('deleteById', () => {
    it('should delete hackathon by id', async () => {
      await repository.deleteById('hack-1');

      expect(prismaService.hackathon.delete).toHaveBeenCalledWith({
        where: { id: 'hack-1' },
      });
    });
  });

  describe('getInsightsData', () => {
    it('should return hackathon with insights relations', async () => {
      const expectedData = { id: 'hack-1', participations: [] };
      (prismaService.hackathon.findUnique as jest.Mock).mockResolvedValue(
        expectedData,
      );

      const result = await repository.getInsightsData('hack-1');

      expect(prismaService.hackathon.findUnique).toHaveBeenCalledWith({
        where: { id: 'hack-1' },
        include: {
          participations: {
            include: {
              team: {
                include: {
                  members: { where: { status: 'ACCEPTED' } },
                },
              },
              scores: true,
              reviews: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedData);
    });
  });
});
