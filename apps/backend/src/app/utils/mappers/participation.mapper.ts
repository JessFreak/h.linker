import {
  UserRegistrationStatusResponse,
  TeamParticipationResponse,
} from '@h.linker/libs';
import { TeamMapper } from './team.mapper';
import { ParticipationWithTeam } from '../../database/entities/participation.entity';
import { Participation, Hackathon } from '@prisma/client';

type ParticipationWithHackathon = Participation & { hackathon: Hackathon };

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

  static getTeamParticipationResponse(
    p: ParticipationWithHackathon,
  ): TeamParticipationResponse {
    return {
      id: p.id,
      hackathonId: p.hackathonId,
      hackathonTitle: p.hackathon.title,
      hackathonSlug: p.hackathon.slug,
      hackathonStatus: p.hackathon.status,
      projectTitle: p.projectTitle,
      projectDescription: p.projectDescription,
      githubRepoUrl: p.githubRepoUrl,
      finalScore: p.finalScore,
    };
  }

  static getTeamParticipationsListResponse(
    participations: ParticipationWithHackathon[],
  ): TeamParticipationResponse[] {
    return (
      participations?.map((p) => this.getTeamParticipationResponse(p)) || []
    );
  }
}
