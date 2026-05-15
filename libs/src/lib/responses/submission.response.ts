export interface JurySubmissionItem {
  participationId: string;
  teamId: string;
  teamName: string;
  projectTitle: string;
  projectDescription: string;
  githubRepoUrl: string;
  finalScore: number;
  submittedAt: Date;
}

export interface JurySubmissionsResponse {
  submissions: JurySubmissionItem[];
}

export interface LeaderboardItem {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardItem[];
}