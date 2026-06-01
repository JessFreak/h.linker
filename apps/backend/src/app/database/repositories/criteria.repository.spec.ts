import { Test, TestingModule } from '@nestjs/testing';
import { CriteriaRepository } from './criteria.repository';
import { PrismaService } from '../prisma.service';

describe('CriteriaRepository', () => {
  let repository: CriteriaRepository;
  let mockTx: any;

  beforeEach(async () => {
    mockTx = {
      criterion: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CriteriaRepository,
        {
          provide: PrismaService,
          useValue: {
            // Мокаємо транзакцію: одразу виконуємо callback, передаючи туди mockTx
            $transaction: jest.fn(async (cb) => cb(mockTx)),
          },
        },
      ],
    }).compile();

    repository = module.get<CriteriaRepository>(CriteriaRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('syncCriteria', () => {
    it('should delete existing criteria and create new ones inside a transaction', async () => {
      const hackathonId = 'hack-123';
      const criteria = [
        { name: 'Idea', weight: 40 },
        { name: 'Code Quality', weight: 60 },
      ] as any[];

      const expectedBatchResult = { count: 2 };
      mockTx.criterion.createMany.mockResolvedValue(expectedBatchResult);

      const result = await repository.syncCriteria(hackathonId, criteria);

      expect(repository['prisma'].$transaction).toHaveBeenCalled();

      expect(mockTx.criterion.deleteMany).toHaveBeenCalledWith({
        where: { hackathonId },
      });

      expect(mockTx.criterion.createMany).toHaveBeenCalledWith({
        data: [
          { name: 'Idea', weight: 40, hackathonId },
          { name: 'Code Quality', weight: 60, hackathonId },
        ],
      });

      expect(result).toEqual(expectedBatchResult);
    });

    it('should handle empty criteria array gracefully', async () => {
      const hackathonId = 'hack-123';
      const criteria: any[] = [];
      const expectedBatchResult = { count: 0 };

      mockTx.criterion.createMany.mockResolvedValue(expectedBatchResult);

      const result = await repository.syncCriteria(hackathonId, criteria);

      expect(mockTx.criterion.deleteMany).toHaveBeenCalledWith({
        where: { hackathonId },
      });

      expect(mockTx.criterion.createMany).toHaveBeenCalledWith({
        data: [],
      });

      expect(result).toEqual(expectedBatchResult);
    });
  });
});
