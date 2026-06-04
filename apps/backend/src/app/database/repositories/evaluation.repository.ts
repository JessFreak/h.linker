import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReviewUpsertData } from '../entities/review.entity';

@Injectable()
export class EvaluationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertScores(
    juryId: string,
    participationId: string,
    scores: Record<string, number>,
  ): Promise<void> {
    const scoreRecords = Object.entries(scores).map(([criterionId, value]) => ({
      juryId,
      participationId,
      criterionId,
      value: Number(value),
    }));

    await this.prisma.$transaction([
      this.prisma.score.deleteMany({
        where: { juryId, participationId },
      }),
      this.prisma.score.createMany({
        data: scoreRecords,
      }),
    ]);
  }

  async upsertComment(
    juryId: string,
    participationId: string,
    data: ReviewUpsertData,
  ): Promise<void> {
    await this.prisma.review.upsert({
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
  }

  async getCriteriaByHackathon(hackathonId: string) {
    return this.prisma.criterion.findMany({
      where: { hackathonId },
    });
  }

  async getScoresByParticipation(participationId: string) {
    return this.prisma.score.findMany({
      where: { participationId },
    });
  }

  async updateParticipationFinalScore(
    participationId: string,
    finalScore: number,
  ): Promise<void> {
    await this.prisma.participation.update({
      where: { id: participationId },
      data: { finalScore },
    });
  }
}
