import { Injectable } from '@nestjs/common';
import { ParticipationRepository } from '../database/repositories/participation.repository';
import { Prisma } from '@prisma/client';
import { ProjectQueryDTO } from '@h.linker/libs';

@Injectable()
export class ProjectService {
  constructor(private participationRepository: ParticipationRepository) {}

  async getShowcaseProjects(query: ProjectQueryDTO) {
    const { search, hackathonId, categories } = query;

    const where: Prisma.ParticipationWhereInput = {
      githubRepoUrl: { not: null },
      finalScore: { gt: 0 },
      hackathon: {
        status: 'FINISHED',
        ...(categories &&
          categories.length > 0 && {
            categories: {
              some: { category: { in: categories } },
            },
          }),
      },
      ...(hackathonId && { hackathonId }),

      ...(search && {
        OR: [
          { projectTitle: { contains: search, mode: 'insensitive' } },
          { projectDescription: { contains: search, mode: 'insensitive' } },
          { team: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    return this.participationRepository.findShowcasePagedByPercentage(
      query,
      where,
    );
  }
}
