export interface ShowcaseProjectResponse {
  participationId: string;
  projectTitle: string;
  projectDescription: string;
  githubRepoUrl: string;
  teamName: string;
  memberCount: number;
  hackathonTitle: string;
  hackathonSlug: string;
  hackathonImageUrl?: string | null;
  finalScore: number;
  maxScore: number;
  scorePercentage: number;
  categories: string[];
}

export interface ProjectShowcaseResponse {
  projects: ShowcaseProjectResponse[];
}
