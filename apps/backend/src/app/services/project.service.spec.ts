import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ParticipationRepository } from '../database/repositories/participation.repository';

describe('ProjectService', () => {
  let service: ProjectService;
  let repository: ParticipationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ParticipationRepository,
          useValue: {
            findShowcasePagedByPercentage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    repository = module.get<ParticipationRepository>(ParticipationRepository);
  });

  it('should call repository with correct default filters', async () => {
    const query = { page: 1, limit: 10 } as any;

    await service.getShowcaseProjects(query);

    expect(repository.findShowcasePagedByPercentage).toHaveBeenCalledWith(
      query,
      expect.objectContaining({
        githubRepoUrl: { not: null },
        finalScore: { gt: 0 },
        hackathon: { status: 'FINISHED' },
      }),
    );
  });

  it('should include category filter when provided', async () => {
    const query = { categories: ['AI', 'Web'] } as any;

    await service.getShowcaseProjects(query);

    expect(repository.findShowcasePagedByPercentage).toHaveBeenCalledWith(
      query,
      expect.objectContaining({
        hackathon: expect.objectContaining({
          categories: { some: { category: { in: ['AI', 'Web'] } } },
        }),
      }),
    );
  });

  it('should include search filter with OR logic', async () => {
    const query = { search: 'myApp' } as any;

    await service.getShowcaseProjects(query);

    expect(repository.findShowcasePagedByPercentage).toHaveBeenCalledWith(
      query,
      expect.objectContaining({
        OR: [
          { projectTitle: { contains: 'myApp', mode: 'insensitive' } },
          { projectDescription: { contains: 'myApp', mode: 'insensitive' } },
          { team: { name: { contains: 'myApp', mode: 'insensitive' } } },
        ],
      }),
    );
  });
});
