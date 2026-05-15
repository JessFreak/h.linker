import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

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
    text: string,
  ): Promise<void> {
    await this.prisma.review.upsert({
      where: {
        juryId_participationId: { juryId, participationId },
      },
      update: {
        summary: text,
      },
      create: {
        juryId,
        participationId,
        summary: text,
      },
    });
  }

  async recalculateProjectFinalScore(
    participationId: string,
    hackathonId: string,
  ): Promise<void> {
    const criteria = await this.prisma.criterion.findMany({
      where: { hackathonId },
    });

    const allScores = await this.prisma.score.findMany({
      where: { participationId },
    });

    if (allScores.length === 0) return;

    const scoresByJury: Record<string, typeof allScores> = {};
    allScores.forEach((s) => {
      if (!scoresByJury[s.juryId]) scoresByJury[s.juryId] = [];
      scoresByJury[s.juryId].push(s);
    });

    let totalHackathonWeightedScore = 0;
    const totalJudgesWhoScored = Object.keys(scoresByJury).length;

    Object.values(scoresByJury).forEach((juryScores) => {
      let juryTotal = 0;
      juryScores.forEach((score) => {
        const criterion = criteria.find((c) => c.id === score.criterionId);
        if (criterion) {
          juryTotal += score.value * (criterion.weight / 100);
        }
      });
      totalHackathonWeightedScore += juryTotal;
    });

    const finalScore =
      totalJudgesWhoScored > 0
        ? totalHackathonWeightedScore / totalJudgesWhoScored
        : 0;

    await this.prisma.participation.update({
      where: { id: participationId },
      data: { finalScore },
    });
  }
}
