import { Injectable } from '@nestjs/common';
import { CriterionDTO } from '@h.linker/libs';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CriteriaRepository {
  constructor(private readonly prisma: PrismaService) {}
  async syncCriteria(hackathonId: string, criteria: CriterionDTO[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.criterion.deleteMany({
        where: { hackathonId },
      });

      return tx.criterion.createMany({
        data: criteria.map((c) => ({
          ...c,
          hackathonId,
        })),
      });
    });
  }
}
