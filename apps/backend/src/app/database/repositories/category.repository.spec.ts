import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from './category.repository';
import { PrismaService } from '../prisma.service';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let prismaService: PrismaService;

  // Мок для об'єкта транзакції (tx)
  let mockTx: any;

  beforeEach(async () => {
    mockTx = {
      hackathonCategory: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      category: {
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: PrismaService,
          useValue: {
            category: {
              upsert: jest.fn(),
              findMany: jest.fn(),
            },
            userCategory: {
              upsert: jest.fn(),
              deleteMany: jest.fn(),
            },
            $transaction: jest.fn(async (cb) => cb(mockTx)),
          },
        },
      ],
    }).compile();

    repository = module.get<CategoryRepository>(CategoryRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertCategory', () => {
    it('should upsert a category', async () => {
      const categoryName = 'TypeScript';
      const expectedResult = { name: categoryName };
      (prismaService.category.upsert as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await repository.upsertCategory(categoryName);

      expect(prismaService.category.upsert).toHaveBeenCalledWith({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('linkUserToCategory', () => {
    it('should link user to category', async () => {
      const userId = 'user-1';
      const skill = 'React';
      const expectedResult = { userId, category: skill };
      (prismaService.userCategory.upsert as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await repository.linkUserToCategory(userId, skill);

      expect(prismaService.userCategory.upsert).toHaveBeenCalledWith({
        where: {
          userId_category: { userId, category: skill },
        },
        update: {},
        create: { userId, category: skill },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteUserSkills', () => {
    it('should delete user skills', async () => {
      const userId = 'user-1';

      await repository.deleteUserSkills(userId);

      expect(prismaService.userCategory.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('syncHackathonCategories', () => {
    it('should return empty array if categoryNames is empty', async () => {
      const hackathonId = 'hack-1';

      const result = await repository.syncHackathonCategories(hackathonId, []);

      expect(mockTx.hackathonCategory.deleteMany).toHaveBeenCalledWith({
        where: { hackathonId },
      });
      // Не має дійти до upsert та createMany
      expect(mockTx.category.upsert).not.toHaveBeenCalled();
      expect(mockTx.hackathonCategory.createMany).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return empty array if categoryNames is undefined', async () => {
      const result = await repository.syncHackathonCategories(
        'hack-1',
        undefined,
      );
      expect(result).toEqual([]);
    });

    it('should sync categories inside a transaction', async () => {
      const hackathonId = 'hack-1';
      const categoryNames = ['NestJS', 'PostgreSQL'];
      const expectedBatchResult = { count: 2 };

      mockTx.hackathonCategory.createMany.mockResolvedValue(
        expectedBatchResult,
      );

      const result = await repository.syncHackathonCategories(
        hackathonId,
        categoryNames,
      );

      // 1. Перевірка видалення старих
      expect(mockTx.hackathonCategory.deleteMany).toHaveBeenCalledWith({
        where: { hackathonId },
      });

      // 2. Перевірка створення/оновлення самих категорій (через Promise.all)
      expect(mockTx.category.upsert).toHaveBeenCalledTimes(2);
      expect(mockTx.category.upsert).toHaveBeenCalledWith({
        where: { name: 'NestJS' },
        update: {},
        create: { name: 'NestJS' },
      });

      // 3. Перевірка створення лінків
      expect(mockTx.hackathonCategory.createMany).toHaveBeenCalledWith({
        data: [
          { hackathonId, category: 'NestJS' },
          { hackathonId, category: 'PostgreSQL' },
        ],
        skipDuplicates: true,
      });

      expect(result).toEqual(expectedBatchResult);
    });
  });

  describe('search', () => {
    it('should perform a broad search if query is not provided', async () => {
      const expectedResult = [{ name: 'A' }, { name: 'B' }];
      (prismaService.category.findMany as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await repository.search();

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {},
        take: 100, // Branch coverage: if !isSearch
        select: { name: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should perform a broad search if query is empty string or only spaces', async () => {
      await repository.search('   ');

      expect(prismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          take: 100,
        }),
      );
    });

    it('should perform a targeted search if valid query is provided', async () => {
      const query = 'Java';
      await repository.search(query);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        take: 10,
        select: { name: true },
        orderBy: { name: 'asc' },
      });
    });
  });
});
