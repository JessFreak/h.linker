import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubService {
  private readonly GITHUB_API_URL = 'https://api.github.com';

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

  async fetchUserSkills(accessToken: string): Promise<Record<string, number>> {
    const skillCounts: Record<string, number> = {};

    const [repos, starred] = await Promise.all([
      this.fetchRepositories(accessToken),
      this.fetchStarred(accessToken),
    ]);

    this.aggregateSkills(repos, skillCounts);
    this.aggregateSkills(starred, skillCounts);

    return skillCounts;
  }

  private async fetchRepositories(token: string): Promise<any[]> {
    const params =
      'per_page=100&affiliation=owner,collaborator,organization_member&sort=updated';
    return this.githubRequest(
      `${this.GITHUB_API_URL}/user/repos?${params}`,
      token,
    );
  }

  private async fetchStarred(token: string): Promise<any[]> {
    return this.githubRequest(
      `${this.GITHUB_API_URL}/user/starred?per_page=100`,
      token,
    );
  }

  private async githubRequest(url: string, token: string): Promise<any[]> {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `token ${token}` },
      });
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error(`GitHub API Error: ${url}`, error);
      return [];
    }
  }

  private aggregateSkills(repos: any[], acc: Record<string, number>): void {
    for (const repo of repos) {
      if (repo.language) {
        this.incrementSkill(acc, repo.language);
      }

      if (repo.topics?.length) {
        for (const topic of repo.topics) {
          this.incrementSkill(acc, topic);
        }
      }
    }
  }

  private incrementSkill(acc: Record<string, number>, skill: string): void {
    const normalized = skill.toLowerCase();

    if (!this.BLACKLIST.has(normalized)) {
      acc[normalized] = (acc[normalized] || 0) + 1;
    }
  }
}
