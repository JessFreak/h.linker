import 'reflect-metadata';
import { HackathonMapper } from './hackathon.mapper';
import { UserMapper } from './user.mapper';

describe('HackathonMapper', () => {
  beforeEach(() => {
    jest
      .spyOn(UserMapper, 'getUserResponse')
      .mockImplementation((user: any) => user);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should map basic hackathon info and convert dates to ISO strings', () => {
    const mockDate = new Date('2026-06-01T10:00:00Z');
    const mockHackathon = {
      id: 'hack-1',
      title: 'Global AI Hackathon',
      slug: 'global-ai-hackathon',
      description: 'Build AI apps',
      prize: '$10000',
      status: 'REGISTRATION',
      imageUrl: 'hack.png',
      registrationStartDate: mockDate,
      startDate: mockDate,
      endDate: mockDate,
      submissionDeadline: mockDate,
    } as any;

    const result = HackathonMapper.mapBasicInfo(mockHackathon);

    expect(result.id).toBe('hack-1');
    expect(result.status).toBe('REGISTRATION');
    // Перевірка форматування дат в рядок (ISO)
    expect(result.registrationStartDate).toBe(mockDate.toISOString());
  });

  it('should map full hackathon response with relations and stats', () => {
    const mockDate = new Date();
    const mockFullHackathon = {
      id: 'hack-2',
      title: 'Full Hackathon',
      slug: 'full-hack',
      registrationStartDate: mockDate,
      startDate: mockDate,
      endDate: mockDate,
      submissionDeadline: mockDate,
      creator: { id: 'user-1', username: 'admin' },
      categories: [{ category: 'AI' }, { category: 'Web' }],
      criteria: [{ id: 'crit-1', name: 'Design' }],
      jury: [
        {
          id: 'jury-1',
          user: { id: 'user-2', username: 'judge1', avatarUrl: 'url1' },
        },
      ],
      _count: {
        participations: 5,
      },
    } as any;

    const result = HackathonMapper.getHackathonResponse(mockFullHackathon);

    expect(result.creator.id).toBe('user-1');
    expect(result.categories).toEqual(['AI', 'Web']);
    expect(result.criteria).toHaveLength(1);
    expect(result.jury[0].username).toBe('judge1');
    expect(result.stats.participations).toBe(5);
  });

  it('should handle empty or null collections gracefully', () => {
    const mockDate = new Date();
    const mockEmptyHackathon = {
      id: 'hack-3',
      registrationStartDate: mockDate,
      startDate: mockDate,
      endDate: mockDate,
      submissionDeadline: mockDate,
      categories: null,
      jury: null,
      criteria: [],
      creator: { id: 'u1' },
    } as any;

    const result = HackathonMapper.getHackathonResponse(mockEmptyHackathon);

    expect(result.categories).toEqual([]);
    expect(result.jury).toEqual([]);
    expect(result.criteria).toEqual([]);
  });

  it('should map a list of hackathons correctly', () => {
    const mockDate = new Date();
    const mockHackathons = [
      {
        id: '1',
        registrationStartDate: mockDate,
        startDate: mockDate,
        endDate: mockDate,
        submissionDeadline: mockDate,
        creator: { id: 'u1' },
        _count: {},
      },
      {
        id: '2',
        registrationStartDate: mockDate,
        startDate: mockDate,
        endDate: mockDate,
        submissionDeadline: mockDate,
        creator: { id: 'u2' },
        _count: {},
      },
    ] as any;

    const result = HackathonMapper.getHackathonsResponse(mockHackathons);

    expect(result.hackathons).toHaveLength(2);
    expect(result.hackathons[0].id).toBe('1');
    expect(result.hackathons[1].id).toBe('2');
  });
});
