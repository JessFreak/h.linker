import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationRepository } from './evaluation.repository';
import { PrismaService } from '../prisma.service';

describe('EvaluationRepository', () => {
  let repository: EvaluationRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationRepository,
        {
          provide: PrismaService,
          useValue: {
            score: {
              deleteMany: jest.fn(),
              createMany: jest.fn(),
              findMany: jest.fn(),
            },
            review: {
              upsert: jest.fn(),
            },
            criterion: {
              findMany: jest.fn(),
            },
            participation: {
              update: jest.fn(),
            },
            $transaction: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    repository = module.get<EvaluationRepository>(EvaluationRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertScores', () => {
    it('should map records correctly and execute transaction', async () => {
      const juryId = 'jury-1';
      const participationId = 'part-1';
      const scores = { C1: 10, C2: 8 };

      await repository.upsertScores(juryId, participationId, scores);

      const expectedScoreRecords = [
        { juryId, participationId, criterionId: 'C1', value: 10 },
        { juryId, participationId, criterionId: 'C2', value: 8 },
      ];

      expect(prismaService.score.deleteMany).toHaveBeenCalledWith({
        where: { juryId, participationId },
      });

      expect(prismaService.score.createMany).toHaveBeenCalledWith({
        data: expectedScoreRecords,
      });

      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should handle empty scores object', async () => {
      await repository.upsertScores('j1', 'p1', {});

      expect(prismaService.score.createMany).toHaveBeenCalledWith({
        data: [],
      });
    });
  });

  describe('upsertComment', () => {
    it('should upsert the review comment', async () => {
      const juryId = 'jury-1';
      const participationId = 'part-1';
      const data = { text: 'Great project', isPublished: true } as any;

      await repository.upsertComment(juryId, participationId, data);

      expect(prismaService.review.upsert).toHaveBeenCalledWith({
        where: {
          juryId_participationId: { juryId, participationId },
        },
        update: data,
        create: {
          juryId,
          participationId,
          ...data,
        },
      });
    });
  });

  describe('recalculateProjectFinalScore', () => {
    const hackathonId = 'hack-1';
    const participationId = 'part-1';

    it('should exit early if there are no scores', async () => {
      (prismaService.criterion.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.score.findMany as jest.Mock).mockResolvedValue([]);

      await repository.recalculateProjectFinalScore(
        participationId,
        hackathonId,
      );

      // Якщо масив allScores порожній, participation.update не має викликатись
      expect(prismaService.participation.update).not.toHaveBeenCalled();
    });

    it('should calculate weighted average correctly for multiple judges', async () => {
      const criteria = [
        { id: 'C1', weight: 40 },
        { id: 'C2', weight: 60 },
      ];
      (prismaService.criterion.findMany as jest.Mock).mockResolvedValue(
        criteria,
      );

      const allScores = [
        // Суддя 1 поставив 10 та 10 -> (10 * 0.4) + (10 * 0.6) = 10
        { juryId: 'J1', criterionId: 'C1', value: 10 },
        { juryId: 'J1', criterionId: 'C2', value: 10 },

        // Суддя 2 поставив 5 та 5 -> (5 * 0.4) + (5 * 0.6) = 5
        { juryId: 'J2', criterionId: 'C1', value: 5 },
        { juryId: 'J2', criterionId: 'C2', value: 5 },

        // Оцінка для неіснуючого критерію (Branch coverage: if (!criterion) ...)
        // Суддя 1 має стару оцінку, якої вже немає в критеріях (має бути проігнорована)
        { juryId: 'J1', criterionId: 'UNKNOWN', value: 10 },
      ];
      (prismaService.score.findMany as jest.Mock).mockResolvedValue(allScores);

      await repository.recalculateProjectFinalScore(
        participationId,
        hackathonId,
      );

      // Загальна сума: 15. Суддів: 2. Фінальний бал: 15 / 2 = 7.5

      expect(prismaService.participation.update).toHaveBeenCalledWith({
        where: { id: participationId },
        data: { finalScore: 7.5 },
      });
    });
  });
});
