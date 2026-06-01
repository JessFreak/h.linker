import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma.service';
import { Paginator } from '../../utils/prisma-pagination.util';
import { BaseQueryDTO } from '@h.linker/libs';

jest.mock('../../utils/prisma-pagination.util', () => ({
  Paginator: {
    paginate: jest.fn(),
  },
}));

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkExistsByUsername', () => {
    it('should return true if user exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'u1',
      });
      const result = await repository.checkExistsByUsername('john_doe');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'john_doe' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await repository.checkExistsByUsername('unknown');
      expect(result).toBe(false);
    });
  });

  describe('checkExistsById', () => {
    it('should return true if user exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'u1',
      });
      const result = await repository.checkExistsById('u1');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await repository.checkExistsById('unknown');
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const data = { username: 'test', email: 'test@test.com' } as any;
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        id: 'u1',
        ...data,
      });

      const result = await repository.create(data);

      expect(prismaService.user.create).toHaveBeenCalledWith({ data });
      expect(result.id).toEqual('u1');
    });
  });

  describe('findAllPaged', () => {
    it('should call Paginator.paginate and execute callbacks', async () => {
      const query: BaseQueryDTO = { page: 1, take: 10, skip: 0 };
      const where = { email: 'test@test.com' };
      const orderBy = { createdAt: 'desc' } as any;
      const expectedPageResponse = { data: [{ id: 'u1' }], meta: {} };

      (Paginator.paginate as jest.Mock).mockImplementation(
        async (findManyCb, countCb, q) => {
          await findManyCb({ skip: 0, take: 10 });
          await countCb();
          return expectedPageResponse;
        },
      );

      const result = await repository.findAllPaged(query, where, orderBy);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where,
        orderBy,
        include: { skills: true },
        skip: 0,
        take: 10,
      });
      expect(prismaService.user.count).toHaveBeenCalledWith({ where });
      expect(result).toEqual(expectedPageResponse);
    });
  });

  describe('findRecommendedPaged', () => {
    const where = { email: { not: null } };

    it('should calculate match percentage, sort properly, and handle missing raw data', async () => {
      const query: BaseQueryDTO = { page: 1, take: 10, skip: 0 };
      const targetSkills = ['React', 'NodeJS'];

      // u1: 50% (React), u2: 100% (React, NodeJS), u3: 0% (Python)
      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'u1', skills: [{ category: 'React' }] },
        { id: 'u2', skills: [{ category: 'React' }, { category: 'NodeJS' }] },
        { id: 'u3', skills: [{ category: 'Python' }] },
      ]);

      // Навмисне не повертаємо u1, щоб покрити гілку `if (!user) return null` та `.filter`
      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'u2', username: 'user2' },
        { id: 'u3', username: 'user3' },
      ]);

      const result = await repository.findRecommendedPaged(
        query,
        where,
        targetSkills,
      );

      // Мають бути відсортовані як: u2 (100%), u1 (50%), u3 (0%)
      expect(prismaService.user.findMany).toHaveBeenNthCalledWith(2, {
        where: { id: { in: ['u2', 'u1', 'u3'] } },
        include: repository['include'],
      });

      expect(result.data).toEqual([
        { id: 'u2', username: 'user2', matchPercentage: 100 },
        { id: 'u3', username: 'user3', matchPercentage: 0 },
      ]);
      expect(result.meta.itemCount).toBe(3);
    });

    it('should handle zero target skills safely (prevent division by zero)', async () => {
      const query: BaseQueryDTO = { skip: 0 }; // Покриття дефолтних параметрів page=1, take=12
      const targetSkills: string[] = [];

      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'u1', skills: [{ category: 'React' }] },
      ]);

      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'u1', username: 'user1' },
      ]);

      const result = await repository.findRecommendedPaged(
        query,
        where,
        targetSkills,
      );

      expect(result.data[0].matchPercentage).toBe(0);
      expect(result.meta.take).toBe(12);
    });
  });

  describe('find', () => {
    it('should return array of users with skills', async () => {
      const expected = [{ id: 'u1' }];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(expected);
      const result = await repository.find({ email: 'test' });
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { email: 'test' },
        include: { skills: true },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('should find user by id with skills', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'u1',
      });
      const result = await repository.findById('u1');
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'u1' },
        include: { skills: true },
      });
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'u1',
      });
      const result = await repository.findByEmail('test@test.com');
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('findByUsername', () => {
    it('should find user by username (not full)', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'u1',
      });
      const result = await repository.findByUsername('johndoe', false);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { username: 'johndoe' },
        include: undefined,
      });
      expect(result).toEqual({ id: 'u1' });
    });

    it('should find user by username (full include)', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'u1',
      });
      const result = await repository.findByUsername('johndoe', true);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { username: 'johndoe' },
        include: repository['FULL_USER_INCLUDE'],
      });
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('findByGithubId', () => {
    it('should find user by githubId', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'u1',
      });
      const result = await repository.findByGithubId('12345');
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { githubId: '12345' },
      });
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('findMany', () => {
    it('should find multiple users without includes', async () => {
      const expected = [{ id: 'u1' }];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(expected);
      const result = await repository.findMany({ email: 'test' });
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { email: 'test' },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('updateById', () => {
    it('should update user and include skills', async () => {
      const data = { username: 'updated' };
      (prismaService.user.update as jest.Mock).mockResolvedValue({
        id: 'u1',
        ...data,
      });
      const result = await repository.updateById('u1', data);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data,
        include: { skills: true },
      });
      expect(result.username).toEqual('updated');
    });
  });

  describe('deleteById', () => {
    it('should delete a user by id', async () => {
      (prismaService.user.delete as jest.Mock).mockResolvedValue({ id: 'u1' });
      const result = await repository.deleteById('u1');
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'u1' },
      });
      expect(result).toEqual({ id: 'u1' });
    });
  });
});
