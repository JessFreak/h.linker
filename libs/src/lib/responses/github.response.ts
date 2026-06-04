export interface GitHubRepoItem {
  name: string;
  url: string;
  description: string | null;
  updatedAt: string;
  language: string;
  languageColor: string;
}

export interface GitHubReposResponse {
  repositories: GitHubRepoItem[];
}

export interface GitHubLanguage {
  name: string;
  percent: number;
}

export interface GitHubInsights {
  totalContributions: number;
  contributionTrend: string;
  totalStars: number;
  starredReposCount: number;
  publicReposCount: number;
  activeReposThisMonth: number;
  topLanguages: GitHubLanguage[];
}
