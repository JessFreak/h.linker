import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepository } from './role.repository';
import { PrismaService } from '../prisma.service';

describe('RoleRepository', () => {
  let repository: RoleRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepository,
        {
          provide: PrismaService,
          useValue: {
            role: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<RoleRepository>(RoleRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findMany', () => {
    it('should return a list of roles ordered by name ascending', async () => {
      const expectedRoles = [
        { id: '1', name: 'ADMIN' },
        { id: '2', name: 'USER' },
      ];
      (prismaService.role.findMany as jest.Mock).mockResolvedValue(
        expectedRoles,
      );

      const result = await repository.findMany();

      expect(prismaService.role.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(expectedRoles);
    });
  });

  describe('create', () => {
    it('should create a new role with the provided name', async () => {
      const name = 'JURY';
      const expectedRole = { id: '3', name };
      (prismaService.role.create as jest.Mock).mockResolvedValue(expectedRole);

      const result = await repository.create(name);

      expect(prismaService.role.create).toHaveBeenCalledWith({
        data: { name },
      });
      expect(result).toEqual(expectedRole);
    });
  });
});
