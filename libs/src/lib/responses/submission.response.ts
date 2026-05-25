export interface JurorScoreItem {
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
}

export interface JurySubmissionItem {
  participationId: string;
  teamId: string;
  teamName: string;
  projectTitle: string;
  projectDescription: string;
  githubRepoUrl: string;
  finalScore: number;
  submittedAt: Date;
  otherScores: JurorScoreItem[];
  submittedScores: Record<string, number>;
  submittedComment: string;
  submittedStrengths?: string;
  submittedWeaknesses?: string;
}

export interface JurySubmissionsResponse {
  submissions: JurySubmissionItem[];
}

export interface TeamReviewResponse {
  juror: string;
  comment: string;
  strengths?: string;
  weaknesses?: string;
}

export interface TeamReviewsResponse {
  reviews: TeamReviewResponse[];
}

export interface LeaderboardItem {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
  memberCount: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardItem[];
}