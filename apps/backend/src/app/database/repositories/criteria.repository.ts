import { Injectable } from '@nestjs/common';
import { CriterionDTO } from '@h.linker/libs';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CriteriaRepository {
  constructor(private readonly prisma: PrismaService) {}
  async syncCriteria(
    hackathonId: string,
    criteria: CriterionDTO[],
  ): Promise<Prisma.BatchPayload> {
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
