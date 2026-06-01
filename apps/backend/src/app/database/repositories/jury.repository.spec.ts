import { Test, TestingModule } from '@nestjs/testing';
import { JuryRepository } from './jury.repository';
import { PrismaService } from '../prisma.service';

describe('JuryRepository', () => {
  let repository: JuryRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JuryRepository,
        {
          provide: PrismaService,
          useValue: {
            jury: {
              create: jest.fn(),
              delete: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<JuryRepository>(JuryRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should add a new jury member', async () => {
      const mockJury = { id: 'j1', hackathonId: 'h1', userId: 'u1' };
      (prismaService.jury.create as jest.Mock).mockResolvedValue(mockJury);

      const result = await repository.add('h1', 'u1');

      expect(prismaService.jury.create).toHaveBeenCalledWith({
        data: {
          hackathonId: 'h1',
          userId: 'u1',
        },
      });
      expect(result).toEqual(mockJury);
    });
  });

  describe('remove', () => {
    it('should remove a jury member by composite ID', async () => {
      const mockJury = { id: 'j1', hackathonId: 'h1', userId: 'u1' };
      (prismaService.jury.delete as jest.Mock).mockResolvedValue(mockJury);

      const result = await repository.remove('h1', 'u1');

      expect(prismaService.jury.delete).toHaveBeenCalledWith({
        where: {
          hackathonId_userId: { hackathonId: 'h1', userId: 'u1' },
        },
      });
      expect(result).toEqual(mockJury);
    });
  });

  describe('isUserInJury', () => {
    it('should return true if jury member exists', async () => {
      (prismaService.jury.findUnique as jest.Mock).mockResolvedValue({
        id: 'j1',
      });

      const result = await repository.isUserInJury('h1', 'u1');

      expect(prismaService.jury.findUnique).toHaveBeenCalledWith({
        where: {
          hackathonId_userId: { hackathonId: 'h1', userId: 'u1' },
        },
      });
      expect(result).toBe(true);
    });

    it('should return false if jury member does not exist', async () => {
      (prismaService.jury.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.isUserInJury('h1', 'u1');

      expect(result).toBe(false);
    });
  });

  describe('getJuryByUserAndHackathon', () => {
    it('should return a jury member object', async () => {
      const mockJury = { id: 'j1', hackathonId: 'h1', userId: 'u1' };
      (prismaService.jury.findUnique as jest.Mock).mockResolvedValue(mockJury);

      const result = await repository.getJuryByUserAndHackathon('u1', 'h1');

      expect(prismaService.jury.findUnique).toHaveBeenCalledWith({
        where: {
          hackathonId_userId: { userId: 'u1', hackathonId: 'h1' },
        },
      });
      expect(result).toEqual(mockJury);
    });
  });
});
