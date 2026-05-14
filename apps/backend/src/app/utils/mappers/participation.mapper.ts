import { UserRegistrationStatusResponse } from '@h.linker/libs';
import { TeamMapper } from './team.mapper';
import { ParticipationWithTeam } from '../../database/entities/participation.entity';

export class ParticipationMapper {
  static getRegistrationStatusResponse(
    registration: ParticipationWithTeam,
  ): UserRegistrationStatusResponse {
    return {
      isRegistered: !!registration,
      team: registration
        ? TeamMapper.getDetailResponse(registration.team)
        : null,
      submission: registration
        ? {
            title: registration.projectTitle,
            description: registration.projectDescription,
            repoUrl: registration.githubRepoUrl,
            finalScore: registration.finalScore,
          }
        : null,
    };
  }
}
