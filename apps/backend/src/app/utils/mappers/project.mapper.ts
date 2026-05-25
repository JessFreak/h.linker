import {
  ProjectShowcaseResponse,
  ShowcaseProjectResponse,
} from '@h.linker/libs';
import { ShowcaseParticipationData } from '../../database/entities/project.entity';

export class ProjectMapper {
  static getShowcaseProject(
    p: ShowcaseParticipationData,
  ): ShowcaseProjectResponse {
    const maxScore = p.hackathon.criteria.reduce(
      (acc, c) => acc + c.maxValue * (c.weight / 100),
      0,
    );

    const scorePercentage = maxScore > 0 ? (p.finalScore / maxScore) * 100 : 0;

    return {
      participationId: p.id,
      projectTitle: p.projectTitle,
      projectDescription: p.projectDescription,
      githubRepoUrl: p.githubRepoUrl,
      teamName: p.team.name,
      memberCount: p.team.members.length,
      hackathonTitle: p.hackathon.title,
      hackathonSlug: p.hackathon.slug,
      hackathonImageUrl: p.hackathon.imageUrl || null,
      finalScore: Number(p.finalScore.toFixed(1)),
      maxScore: Number(maxScore.toFixed(1)),
      scorePercentage: Number(scorePercentage.toFixed(1)),
    };
  }

  static getShowcaseProjects(
    projects: ShowcaseParticipationData[],
  ): ProjectShowcaseResponse {
    return {
      projects: projects.map((p) => ProjectMapper.getShowcaseProject(p)),
    };
  }
}
