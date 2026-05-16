import {
  UserRegistrationStatusResponse,
  TeamParticipationResponse,
  JurySubmissionItem,
  JurySubmissionsResponse,
  LeaderboardResponse,
  TeamReviewsResponse,
} from '@h.linker/libs';
import { TeamMapper } from './team.mapper';
import {
  LeaderboardRow,
  ParticipationWithScoresAndReviews,
  ParticipationWithTeam,
  ReviewWithJuryData,
} from '../../database/entities/participation.entity';
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

  static getJurySubmissionItem(
    p: ParticipationWithScoresAndReviews,
    currentUserId: string,
  ): JurySubmissionItem {
    const juryScoresMap: Record<
      string,
      {
        userId: string;
        username: string;
        avatarUrl?: string;
        totalWeighted: number;
      }
    > = {};
    const submittedScores: Record<string, number> = {};

    p.scores?.forEach((score) => {
      const juryId = score.juryId;
      const userId = score.jury.user.id;
      const username = score.jury.user.username;
      const avatarUrl = score.jury.user.avatarUrl ?? undefined;
      const weight = score.criterion.weight;
      const value = score.value;

      if (userId === currentUserId) {
        submittedScores[score.criterionId] = value;
      }

      if (!juryScoresMap[juryId]) {
        juryScoresMap[juryId] = {
          userId,
          username,
          avatarUrl,
          totalWeighted: 0,
        };
      }
      juryScoresMap[juryId].totalWeighted += value * (weight / 100);
    });

    const myReview = p.reviews?.find((r) => r.jury.user.id === currentUserId);
    const submittedComment = myReview ? myReview.summary : '';

    const otherScores = Object.values(juryScoresMap).map((js) => ({
      userId: js.userId,
      username: js.username,
      avatarUrl: js.avatarUrl,
      score: Number(js.totalWeighted.toFixed(1)),
    }));

    return {
      participationId: p.id,
      teamId: p.teamId,
      teamName: p.team.name,
      projectTitle: p.projectTitle || 'Untitled Project',
      projectDescription: p.projectDescription || '',
      githubRepoUrl: p.githubRepoUrl || '',
      finalScore: p.finalScore,
      submittedAt: p.updatedAt,
      otherScores,
      submittedScores,
      submittedComment,
    };
  }

  static getJurySubmissionsResponse(
    participations: ParticipationWithScoresAndReviews[],
    currentUserId: string,
  ): JurySubmissionsResponse {
    return {
      submissions: participations.map((p) =>
        this.getJurySubmissionItem(p, currentUserId),
      ),
    };
  }

  static getLeaderboardResponse(
    participations: LeaderboardRow[],
  ): LeaderboardResponse {
    return {
      leaderboard: participations.map((p, index) => ({
        rank: index + 1,
        teamId: p.teamId,
        teamName: p.team.name,
        score: p.finalScore,
      })),
    };
  }

  static getTeamReviewsResponse(
    reviews: ReviewWithJuryData[],
  ): TeamReviewsResponse {
    return {
      reviews: reviews.map((r) => ({
        juror: r.jury.user.username,
        comment: r.summary,
      })),
    };
  }
}
