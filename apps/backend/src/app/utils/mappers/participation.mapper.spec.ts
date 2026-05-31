import 'reflect-metadata';
import { ParticipationMapper } from './participation.mapper';
import { TeamMapper } from './team.mapper';

describe('ParticipationMapper', () => {
  beforeEach(() => {
    jest
      .spyOn(TeamMapper, 'getDetailResponse')
      .mockImplementation((team: any) => team);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return isRegistered: false when registration is null', () => {
    const result = ParticipationMapper.getRegistrationStatusResponse(null);
    expect(result.isRegistered).toBe(false);
    expect(result.team).toBeNull();
  });

  it('should calculate average criteria scores correctly in getRegistrationStatusResponse', () => {
    const mockRegistration = {
      projectTitle: 'Cool App',
      team: { id: 'team-1', name: 'Devs' },
      scores: [
        // Журі 1 поставив 8 балів
        {
          criterionId: 'crit-1',
          value: 8,
          criterion: { name: 'Design', maxValue: 10 },
        },
        // Журі 2 поставив 10 балів за той самий критерій
        {
          criterionId: 'crit-1',
          value: 10,
          criterion: { name: 'Design', maxValue: 10 },
        },
      ],
    } as any;

    const result =
      ParticipationMapper.getRegistrationStatusResponse(mockRegistration);

    expect(result.isRegistered).toBe(true);
    // (8 + 10) / 2 = 9
    expect(result.submission?.criteriaScores).toBeDefined();
    expect(result.submission?.criteriaScores?.[0].score).toBe(9);
    expect(result.submission?.criteriaScores?.[0].name).toBe('Design');
  });

  it('should calculate weighted score and separate current user scores in getJurySubmissionItem', () => {
    const currentUserId = 'user-1';

    const mockParticipation = {
      id: 'part-1',
      teamId: 'team-1',
      team: { name: 'Alpha' },
      scores: [
        // Оцінка від поточного юзера (вага критерію 50%)
        {
          juryId: 'jury-1',
          value: 10,
          criterionId: 'crit-1',
          criterion: { weight: 50 },
          jury: { user: { id: 'user-1', username: 'me' } },
        },
        // Оцінка від іншого журі (вага критерію 50%)
        {
          juryId: 'jury-2',
          value: 8,
          criterionId: 'crit-1',
          criterion: { weight: 50 },
          jury: { user: { id: 'user-2', username: 'other' } },
        },
      ],
      reviews: [
        {
          summary: 'Good job',
          strengths: 'UI',
          weaknesses: 'UX',
          jury: { user: { id: 'user-1' } },
        },
      ],
    } as any;

    const result = ParticipationMapper.getJurySubmissionItem(
      mockParticipation,
      currentUserId,
    );

    expect(result.submittedScores['crit-1']).toBe(10);
    expect(result.submittedComment).toBe('Good job');

    // 8 балів * (50% / 100) = 4.0
    const otherJuryScore = result.otherScores.find(
      (s) => s.userId === 'user-2',
    );
    expect(otherJuryScore?.score).toBe(4.0);

    // 10 * 0.5 = 5.0
    const myJuryScore = result.otherScores.find((s) => s.userId === 'user-1');
    expect(myJuryScore?.score).toBe(5.0);
  });

  it('should assign correct ranks in getLeaderboardResponse', () => {
    const mockLeaderboardRows = [
      { teamId: 't1', team: { name: 'A', members: [] }, finalScore: 100 },
      { teamId: 't2', team: { name: 'B', members: [] }, finalScore: 80 },
    ] as any[];

    const result =
      ParticipationMapper.getLeaderboardResponse(mockLeaderboardRows);

    expect(result.leaderboard[0].rank).toBe(1);
    expect(result.leaderboard[0].teamName).toBe('A');
    expect(result.leaderboard[1].rank).toBe(2);
    expect(result.leaderboard[1].teamName).toBe('B');
  });

  it('should handle empty reviews and missing score data in getJurySubmissionItem', () => {
    const mockParticipation = {
      id: 'part-2',
      teamId: 't2',
      team: { name: 'Empty Team' },
      scores: [], // Немає оцінок
      reviews: [], // Немає відгуків
    } as any;

    const result = ParticipationMapper.getJurySubmissionItem(
      mockParticipation,
      'u1',
    );

    expect(result.submittedScores).toEqual({});
    expect(result.submittedComment).toBe('');
    expect(result.otherScores).toEqual([]);
  });

  it('should map team reviews correctly', () => {
    const mockReviews = [
      {
        summary: 'Great work',
        strengths: 'Clean code',
        weaknesses: 'N/A',
        jury: { user: { username: 'juror1' } },
      },
    ] as any;

    const result = ParticipationMapper.getTeamReviewsResponse(mockReviews);

    expect(result.reviews).toHaveLength(1);
    expect(result.reviews[0].juror).toBe('juror1');
    expect(result.reviews[0].comment).toBe('Great work');
  });

  it('should return empty list if participations is null in getTeamParticipationsListResponse', () => {
    const result = ParticipationMapper.getTeamParticipationsListResponse(
      null as any,
    );
    expect(result).toEqual([]);
  });
});
