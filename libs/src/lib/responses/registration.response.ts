import { TeamResponse } from './team.response';

export interface CriterionScoreDetail {
  criterionId: string;
  name: string;
  score: number;
  maxValue: number;
}

export interface UserRegistrationStatusResponse {
  isRegistered: boolean;
  team: TeamResponse | null;
  submission: {
    title: string | null;
    description: string | null;
    repoUrl: string | null;
    finalScore: number;
    criteriaScores?: CriterionScoreDetail[];
  } | null;
}
