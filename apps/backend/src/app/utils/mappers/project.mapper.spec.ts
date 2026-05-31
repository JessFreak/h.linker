import 'reflect-metadata';
import { ProjectMapper } from './project.mapper';

describe('ProjectMapper Full Coverage', () => {
  it('should calculate correct score percentage for a showcase project', () => {
    const mockParticipation = {
      id: 'part-1',
      projectTitle: 'Super App',
      finalScore: 8.5,
      team: {
        name: 'Dream Team',
        members: [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }],
      },
      hackathon: {
        title: 'KPI Hack',
        slug: 'kpi-hack',
        imageUrl: 'image.png',
        categories: [{ category: 'AI' }],
        criteria: [
          { maxValue: 10, weight: 50 },
          { maxValue: 10, weight: 50 },
        ],
      },
    } as any;

    const result = ProjectMapper.getShowcaseProject(mockParticipation);
    expect(result.scorePercentage).toBe(85.0);
  });

  it('should handle zero maxScore to prevent division by zero', () => {
    const mockParticipation = {
      id: 'part-2',
      finalScore: 5.0,
      team: { name: 'Empty Team', members: [] },
      hackathon: {
        title: 'Empty Hack',
        categories: [],
        criteria: [], // maxScore буде 0
      },
    } as any;

    const result = ProjectMapper.getShowcaseProject(mockParticipation);

    expect(result.maxScore).toBe(0);
    expect(result.scorePercentage).toBe(0);
  });

  it('should handle multiple projects in getShowcaseProjects', () => {
    const mockProjects = [
      {
        id: '1',
        finalScore: 10,
        team: { name: 'T1', members: [] },
        hackathon: {
          categories: [],
          criteria: [{ maxValue: 10, weight: 100 }],
        },
      },
      {
        id: '2',
        finalScore: 5,
        team: { name: 'T2', members: [] },
        hackathon: {
          categories: [],
          criteria: [{ maxValue: 10, weight: 100 }],
        },
      },
    ] as any;

    const result = ProjectMapper.getShowcaseProjects(mockProjects);

    expect(result.projects).toHaveLength(2);
    expect(result.projects[0].finalScore).toBe(10);
    expect(result.projects[1].finalScore).toBe(5);
  });
});
