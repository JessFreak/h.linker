import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GitHubInsights, GitHubLanguage } from '@h.linker/libs';

interface GitHubGraphQLResponse {
  data: {
    viewer: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              contributionCount: number;
              date: string;
            }>;
          }>;
        };
      };
      repositories: {
        totalCount: number;
        nodes: GitHubRepoNode[];
      };
      starredRepositories: {
        nodes: Array<{
          languages?: { nodes: Array<{ name: string }> };
          repositoryTopics?: { nodes: Array<{ topic: { name: string } }> };
        }>;
      };
    };
  };
}

interface GitHubRepoNode {
  name: string;
  stargazerCount: number;
  updatedAt: string;
  languages: {
    edges: Array<{
      size: number;
      node: { name: string };
    }>;
  };
  repositoryTopics: {
    nodes: Array<{
      topic: { name: string };
    }>;
  };
}

export interface GitHubProfileData {
  skills: string[];
  insights: GitHubInsights | null;
}

@Injectable()
export class GithubService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private readonly GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
  private readonly BLACKLIST = new Set([
    'coursework',
    'example',
    'service',
    'client-server',
    'practice',
    'project',
    'university',
    'lab',
    'test',
    'education',
    'homework',
    'assignment',
    'task',
    'exercises',
    'study',
    'learning',
    'tutorial',
    'template',
    'docs',
  ]);

  async getProfileData(
    accessToken: string,
    username: string,
  ): Promise<GitHubProfileData> {
    const cacheKey = `gh_profile_${username.toLowerCase()}`;
    const cachedData = await this.cacheManager.get<GitHubProfileData>(cacheKey);
    if (cachedData) return cachedData;

    const query = `
      query {
        viewer {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
          repositories(first: 100, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], orderBy: {field: UPDATED_AT, direction: DESC}) {
            totalCount
            nodes {
              stargazerCount
              updatedAt
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { 
                edges { size node { name } } 
              }
              repositoryTopics(first: 10) { nodes { topic { name } } }
            }
          }
          starredRepositories(first: 100) {
            nodes {
              languages(first: 5) { nodes { name } }
              repositoryTopics(first: 5) { nodes { topic { name } } }
            }
          }
        }
      }
    `;

    const response = await fetch(this.GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const result = (await response.json()) as unknown as GitHubGraphQLResponse;
    const viewer = result.data?.viewer;

    if (!viewer) return { skills: [], insights: null };

    const skillCounts: Record<string, number> = {};
    const languageByteSizes: Record<string, number> = {};
    let totalStars = 0;
    let ownedReposWithStars = 0;
    let activeReposThisMonth = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Обробка репозиторіїв
    for (const repo of viewer.repositories.nodes) {
      // Рахуємо активні репо
      if (new Date(repo.updatedAt) > thirtyDaysAgo) {
        activeReposThisMonth++;
      }

      const stars = repo.stargazerCount;
      if (stars > 0) {
        totalStars += stars;
        ownedReposWithStars++;
      }

      for (const edge of repo.languages.edges) {
        languageByteSizes[edge.node.name] =
          (languageByteSizes[edge.node.name] || 0) + edge.size;
        this.incrementSkill(skillCounts, edge.node.name);
      }

      for (const t of repo.repositoryTopics.nodes) {
        this.incrementSkill(skillCounts, t.topic.name);
      }
    }

    // 2. Розрахунок тренду контріб'ютів (останні 30 днів vs попередні 30 днів)
    const trend = this.calculateContributionTrend(
      viewer.contributionsCollection.contributionCalendar.weeks,
    );

    // 3. Зірки та мови (залишаємо як було)
    for (const starred of viewer.starredRepositories.nodes) {
      starred.languages?.nodes?.forEach((l) =>
        this.incrementSkill(skillCounts, l.name),
      );
      starred.repositoryTopics?.nodes?.forEach((t) =>
        this.incrementSkill(skillCounts, t.topic.name),
      );
    }

    const finalData: GitHubProfileData = {
      skills: Object.keys(skillCounts).sort(
        (a, b) => skillCounts[b] - skillCounts[a],
      ),
      insights: {
        totalContributions:
          viewer.contributionsCollection.contributionCalendar
            .totalContributions,
        contributionTrend: trend,
        totalStars,
        starredReposCount: ownedReposWithStars,
        publicReposCount: viewer.repositories.totalCount,
        activeReposThisMonth: activeReposThisMonth,
        topLanguages: this.calculateTopLanguages(languageByteSizes),
      },
    };

    await this.cacheManager.set(cacheKey, finalData, 3600);
    return finalData;
  }

  private calculateContributionTrend(
    weeks: GitHubGraphQLResponse['data']['viewer']['contributionsCollection']['contributionCalendar']['weeks'],
  ): string {
    const days = weeks
      .flatMap((w) => w.contributionDays)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const last30Days = days
      .slice(0, 30)
      .reduce((sum, d) => sum + d.contributionCount, 0);
    const prev30Days = days
      .slice(30, 60)
      .reduce((sum, d) => sum + d.contributionCount, 0);

    if (prev30Days === 0) return '↑ 0%';
    const diff = ((last30Days - prev30Days) / prev30Days) * 100;
    const sign = diff >= 0 ? '↑' : '↓';
    return `${sign} ${Math.abs(Math.round(diff))}% from last month`;
  }

  private incrementSkill(acc: Record<string, number>, skill: string): void {
    const normalized = skill.toLowerCase();
    if (!this.BLACKLIST.has(normalized)) {
      acc[normalized] = (acc[normalized] || 0) + 1;
    }
  }

  private calculateTopLanguages(
    sizes: Record<string, number>,
  ): GitHubLanguage[] {
    const entries = Object.entries(sizes);
    if (entries.length === 0) return [];

    let totalBytes = 0;
    for (const [, size] of entries) totalBytes += size;

    return entries
      .map(([name, size]) => ({
        name,
        percent: Math.round((size / totalBytes) * 100),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);
  }
}
