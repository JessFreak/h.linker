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

  describe('getRegistrationStatusResponse', () => {
    it('should return isRegistered: false when registration is null', () => {
      const result = ParticipationMapper.getRegistrationStatusResponse(null);
      expect(result.isRegistered).toBe(false);
      expect(result.team).toBeNull();
    });

    it('should calculate average criteria scores correctly', () => {
      const mockRegistration = {
        projectTitle: 'Cool App',
        team: { id: 'team-1', name: 'Devs' },
        scores: [
          {
            criterionId: 'crit-1',
            value: 8,
            criterion: { name: 'Design', maxValue: 10 },
          },
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
      expect(result.submission?.criteriaScores).toBeDefined();
      expect(result.submission?.criteriaScores?.[0].score).toBe(9); // (8 + 10) / 2
      expect(result.submission?.criteriaScores?.[0].name).toBe('Design');
      expect(result.submission?.criteriaScores?.[0].maxValue).toBe(10);
    });

    it('should fallback to maxValue 10 if criterion.maxValue is missing', () => {
      // score.criterion.maxValue || 10
      const mockRegistration = {
        scores: [
          {
            criterionId: 'crit-2',
            value: 5,
            criterion: { name: 'Idea' }, // maxValue відсутнє
          },
        ],
      } as any;

      const result =
        ParticipationMapper.getRegistrationStatusResponse(mockRegistration);
      expect(result.submission?.criteriaScores?.[0].maxValue).toBe(10);
    });
  });

  describe('getTeamParticipationsListResponse', () => {
    it('should map a list of team participations correctly', () => {
      const mockParticipations = [
        {
          id: 'p1',
          hackathonId: 'h1',
          hackathon: { title: 'Hack 1', slug: 'hack-1', status: 'ACTIVE' },
          projectTitle: 'PT',
          projectDescription: 'PD',
          githubRepoUrl: 'url',
          finalScore: 100,
        },
      ] as any;

      const result =
        ParticipationMapper.getTeamParticipationsListResponse(
          mockParticipations,
        );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');
      expect(result[0].hackathonTitle).toBe('Hack 1');
      expect(result[0].projectTitle).toBe('PT');
    });

    it('should return empty list if participations is null', () => {
      const result = ParticipationMapper.getTeamParticipationsListResponse(
        null as any,
      );
      expect(result).toEqual([]);
    });
  });

  describe('getJurySubmissionItem & getJurySubmissionsResponse', () => {
    it('should calculate weighted score and handle avatar/review fallbacks', () => {
      const currentUserId = 'user-1';

      const mockParticipation = {
        id: 'part-1',
        teamId: 'team-1',
        team: { name: 'Alpha' },
        scores: [
          {
            juryId: 'jury-1',
            value: 10,
            criterionId: 'crit-1',
            criterion: { weight: 50 },
            jury: {
              user: {
                id: 'user-1',
                username: 'me',
                avatarUrl: 'http://ava.jpg',
              },
            },
          },
          {
            juryId: 'jury-2',
            value: 8,
            criterionId: 'crit-1',
            criterion: { weight: 50 },
            jury: {
              user: { id: 'user-2', username: 'other', avatarUrl: null },
            },
          },
        ],
        reviews: [
          {
            summary: 'Good job',
            strengths: null,
            weaknesses: '',
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
      expect(result.submittedStrengths).toBeUndefined();
      expect(result.submittedWeaknesses).toBeUndefined();

      const otherJuryScore = result.otherScores.find(
        (s) => s.userId === 'user-2',
      );
      expect(otherJuryScore?.score).toBe(4.0); // 8 * 0.5
      expect(otherJuryScore?.avatarUrl).toBeUndefined();

      const myJuryScore = result.otherScores.find((s) => s.userId === 'user-1');
      expect(myJuryScore?.score).toBe(5.0); // 10 * 0.5
      expect(myJuryScore?.avatarUrl).toBe('http://ava.jpg');
    });

    it('should handle undefined reviews and scores gracefully', () => {
      const mockParticipation = {
        id: 'part-2',
        teamId: 't2',
        team: { name: 'Empty Team' },
      } as any;

      const result = ParticipationMapper.getJurySubmissionItem(
        mockParticipation,
        'u1',
      );

      expect(result.submittedScores).toEqual({});
      expect(result.submittedComment).toBe('');
      expect(result.otherScores).toEqual([]);
    });

    it('should map a list of jury submissions', () => {
      // Покриває getJurySubmissionsResponse
      const mockParticipations = [
        {
          id: 'p1',
          teamId: 't1',
          team: { name: 'A' },
          scores: [],
          reviews: [],
        },
      ] as any;

      const result = ParticipationMapper.getJurySubmissionsResponse(
        mockParticipations,
        'user-1',
      );

      expect(result.submissions).toHaveLength(1);
      expect(result.submissions[0].participationId).toBe('p1');
      expect(result.submissions[0].teamName).toBe('A');
    });
  });

  describe('getLeaderboardResponse', () => {
    it('should assign correct ranks', () => {
      const mockLeaderboardRows = [
        { teamId: 't1', team: { name: 'A', members: [] }, finalScore: 100 },
        { teamId: 't2', team: { name: 'B', members: [1, 2] }, finalScore: 80 },
      ] as any[];

      const result =
        ParticipationMapper.getLeaderboardResponse(mockLeaderboardRows);

      expect(result.leaderboard[0].rank).toBe(1);
      expect(result.leaderboard[0].teamName).toBe('A');
      expect(result.leaderboard[0].memberCount).toBe(0);

      expect(result.leaderboard[1].rank).toBe(2);
      expect(result.leaderboard[1].teamName).toBe('B');
      expect(result.leaderboard[1].memberCount).toBe(2);
    });
  });

  describe('getTeamReviewsResponse', () => {
    it('should map team reviews correctly and handle missing strengths/weaknesses', () => {
      const mockReviews = [
        {
          summary: 'Great work',
          strengths: 'Clean code',
          weaknesses: 'N/A',
          jury: { user: { username: 'juror1' } },
        },
        {
          summary: 'Needs improvement',
          strengths: null,
          weaknesses: '',
          jury: { user: { username: 'juror2' } },
        },
      ] as any;

      const result = ParticipationMapper.getTeamReviewsResponse(mockReviews);

      expect(result.reviews).toHaveLength(2);

      expect(result.reviews[0].juror).toBe('juror1');
      expect(result.reviews[0].strengths).toBe('Clean code');

      expect(result.reviews[1].juror).toBe('juror2');
      expect(result.reviews[1].strengths).toBeUndefined();
      expect(result.reviews[1].weaknesses).toBeUndefined();
    });
  });
});
