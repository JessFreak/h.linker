import {
  FullHackathonResponse,
  CriterionResponse,
  JuryResponse,
  HackathonStatus,
  HackathonResponse,
  HackathonsResponse,
} from '@h.linker/libs';
import { FullHackathon } from '../../database/entities/hackathon.entity';
import { Hackathon } from '@prisma/client';
import { UserMapper } from './user.mapper';

export class HackathonMapper {
  static getHackathonResponse(
    prismaHackathon: FullHackathon,
  ): FullHackathonResponse {
    return {
      creator: UserMapper.getUserResponse(prismaHackathon.creator),
      ...this.mapBasicInfo(prismaHackathon),
      ...this.mapTimeline(prismaHackathon),
      categories: this.mapCategories(prismaHackathon.categories),
      criteria: this.mapCriteria(prismaHackathon.criteria),
      jury: this.mapJury(prismaHackathon.jury),
      stats: prismaHackathon._count,
    };
  }

  static getHackathonsResponse(
    hackathons: FullHackathon[],
  ): HackathonsResponse {
    return {
      hackathons: hackathons.map((h) => this.getHackathonResponse(h)),
    };
  }

  static mapBasicInfo(hackathon: Hackathon): HackathonResponse {
    return {
      id: hackathon.id,
      title: hackathon.title,
      slug: hackathon.slug,
      description: hackathon.description,
      prize: hackathon.prize,
      status: hackathon.status as HackathonStatus,
      imageUrl: hackathon.imageUrl,
    };
  }

  private static mapTimeline(hackathon: FullHackathon) {
    return {
      registrationStartDate: hackathon.registrationStartDate.toISOString(),
      startDate: hackathon.startDate.toISOString(),
      endDate: hackathon.endDate.toISOString(),
      submissionDeadline: hackathon.submissionDeadline.toISOString(),
    };
  }

  private static mapCategories(
    categories: FullHackathon['categories'],
  ): string[] {
    return categories?.map((c) => c.category) || [];
  }

  private static mapCriteria(
    criteria: FullHackathon['criteria'],
  ): CriterionResponse[] {
    return criteria || [];
  }

  private static mapJury(jury: FullHackathon['jury']): JuryResponse[] {
    return (
      jury?.map((j) => ({
        id: j.id,
        userId: j.user.id,
        username: j.user.username,
        avatarUrl: j.user.avatarUrl || undefined,
      })) || []
    );
  }
}
