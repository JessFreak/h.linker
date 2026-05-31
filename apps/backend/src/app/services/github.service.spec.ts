import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from './github.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('GithubService', () => {
  let service: GithubService;
  let cacheManager: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  it('should return cached data if available', async () => {
    const cached = { skills: ['TS'], insights: null };
    cacheManager.get.mockResolvedValue(cached);

    const result = await service.getProfileData('token', 'user');
    expect(result).toEqual(cached);
    expect(cacheManager.set).not.toHaveBeenCalled();
  });

  it('should fetch and cache data if not cached', async () => {
    cacheManager.get.mockResolvedValue(null);
    const mockResponse = {
      data: {
        viewer: {
          contributionsCollection: {
            contributionCalendar: { totalContributions: 10, weeks: [] },
          },
          repositories: { totalCount: 1, nodes: [] },
          starredRepositories: { nodes: [] },
        },
      },
    };
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.getProfileData('token', 'user');
    expect(result.insights?.totalContributions).toBe(10);
    expect(cacheManager.set).toHaveBeenCalled();
  });

  it('should throw if fetch fails', async () => {
    cacheManager.get.mockResolvedValue(null);
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(service.getProfileData('token', 'user')).rejects.toThrow(
      'Network error',
    );
  });

  it('should throw if token is missing', async () => {
    await expect(service.getProfileData('', 'user')).rejects.toThrow();
  });

  it('should handle malformed API response gracefully', async () => {
    cacheManager.get.mockResolvedValue(null);
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ data: {} }), // viewer відсутній
    });

    const result = await service.getProfileData('token', 'user');
    expect(result.skills).toEqual([]);
  });

  it('should ignore blacklisted skills and normalize case', () => {
    const acc: Record<string, number> = {};
    (service as any).incrementSkill(acc, 'university');
    (service as any).incrementSkill(acc, 'NestJS');
    (service as any).incrementSkill(acc, 'nestjs');

    expect(acc['university']).toBeUndefined();
    expect(acc['nestjs']).toBe(2);
  });

  it('should accumulate multiple skills correctly', () => {
    const acc: Record<string, number> = {};
    (service as any).incrementSkill(acc, 'React');
    (service as any).incrementSkill(acc, 'React');
    (service as any).incrementSkill(acc, 'Angular');

    expect(acc['react']).toBe(2);
    expect(acc['angular']).toBe(1);
  });

  it('should return correct percentages', () => {
    const sizes = { TS: 80, JS: 20 };
    const result = (service as any).calculateTopLanguages(sizes);

    expect(result[0]).toEqual({ name: 'TS', percent: 80 });
    expect(result[1]).toEqual({ name: 'JS', percent: 20 });
  });

  it('should handle empty sizes gracefully', () => {
    const result = (service as any).calculateTopLanguages({});
    expect(result).toEqual([]);
  });

  it('should normalize percentages when total != 100', () => {
    const sizes = { TS: 2, JS: 1 }; // total = 3
    const result = (service as any).calculateTopLanguages(sizes);

    expect(result[0].percent + result[1].percent).toBe(100);
  });

  it('should calculate percentage correctly', () => {
    const weeks = [
      {
        contributionDays: [
          ...Array(30).fill({ contributionCount: 10, date: '2026-06-01' }),
          ...Array(30).fill({ contributionCount: 5, date: '2026-01-01' }),
        ],
      },
    ] as any;

    const result = (service as any).calculateContributionTrend(weeks);
    expect(result).toContain('↑ 100%');
  });

  it('should handle no contributions gracefully', () => {
    const weeks = [{ contributionDays: [] }] as any;
    const result = (service as any).calculateContributionTrend(weeks);
    expect(result).toBe('0 contributions');
  });

  it('should handle single period of contributions', () => {
    const weeks = [
      {
        contributionDays: [
          ...Array(30).fill({ contributionCount: 1, date: '2026-06-01' }),
        ],
      },
    ] as any;

    const result = (service as any).calculateContributionTrend(weeks);
    expect(result).toBe('No previous period');
  });

  it('should correctly process repository data and starred repositories', async () => {
    cacheManager.get.mockResolvedValue(null);
    const mockResponse = {
      data: {
        viewer: {
          contributionsCollection: {
            contributionCalendar: { totalContributions: 0, weeks: [] },
          },
          repositories: {
            totalCount: 1,
            nodes: [
              {
                stargazerCount: 5,
                updatedAt: new Date().toISOString(),
                languages: {
                  edges: [{ size: 100, node: { name: 'TypeScript' } }],
                },
                repositoryTopics: { nodes: [{ topic: { name: 'nestjs' } }] },
              },
            ],
          },
          starredRepositories: {
            nodes: [
              {
                languages: { nodes: [{ name: 'JavaScript' }] },
                repositoryTopics: { nodes: [{ topic: { name: 'react' } }] },
              },
            ],
          },
        },
      },
    };
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.getProfileData('token', 'user');

    expect(result.insights?.activeReposThisMonth).toBe(1);
    expect(result.insights?.totalStars).toBe(5);
    expect(result.skills).toContain('typescript');
    expect(result.skills).toContain('nestjs');
    expect(result.skills).toContain('javascript');
    expect(result.skills).toContain('react');
  });
});
