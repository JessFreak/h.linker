import { Injectable } from '@nestjs/common';
import { ParticipationRepository } from '../database/repositories/participation.repository';
import { ShowcaseParticipationData } from '../database/entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(private participationRepository: ParticipationRepository) {}

  async getTopShowcaseProjects(): Promise<ShowcaseParticipationData[]> {
    const rawProjects =
      await this.participationRepository.getTopShowcaseProjects();

    return rawProjects
      .sort((a, b) => {
        const maxA = a.hackathon.criteria.reduce(
          (acc, c) => acc + c.maxValue * (c.weight / 100),
          0,
        );
        const maxB = b.hackathon.criteria.reduce(
          (acc, c) => acc + c.maxValue * (c.weight / 100),
          0,
        );

        const percentA = maxA > 0 ? (a.finalScore / maxA) * 100 : 0;
        const percentB = maxB > 0 ? (b.finalScore / maxB) * 100 : 0;

        return percentB - percentA;
      })
      .slice(0, 20);
  }
}
