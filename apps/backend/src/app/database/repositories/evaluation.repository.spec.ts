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
      const data = { summary: 'Great project', strengths: 'UI' } as any;

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

  describe('getCriteriaByHackathon', () => {
    it('should fetch criteria for a specific hackathon', async () => {
      const hackathonId = 'hack-1';
      const mockCriteria = [{ id: 'C1', weight: 40 }];

      (prismaService.criterion.findMany as jest.Mock).mockResolvedValue(
        mockCriteria,
      );

      const result = await repository.getCriteriaByHackathon(hackathonId);

      expect(prismaService.criterion.findMany).toHaveBeenCalledWith({
        where: { hackathonId },
      });
      expect(result).toEqual(mockCriteria);
    });
  });

  describe('getScoresByParticipation', () => {
    it('should fetch scores for a specific participation', async () => {
      const participationId = 'part-1';
      const mockScores = [{ value: 10, criterionId: 'C1' }];

      (prismaService.score.findMany as jest.Mock).mockResolvedValue(mockScores);

      const result = await repository.getScoresByParticipation(participationId);

      expect(prismaService.score.findMany).toHaveBeenCalledWith({
        where: { participationId },
      });
      expect(result).toEqual(mockScores);
    });
  });

  describe('updateParticipationFinalScore', () => {
    it('should update the final score of a participation', async () => {
      const participationId = 'part-1';
      const finalScore = 8.5;

      await repository.updateParticipationFinalScore(
        participationId,
        finalScore,
      );

      expect(prismaService.participation.update).toHaveBeenCalledWith({
        where: { id: participationId },
        data: { finalScore },
      });
    });
  });
});
