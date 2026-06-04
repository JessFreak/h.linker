import { Test, TestingModule } from '@nestjs/testing';
import { HackathonService } from './hackathon.service';
import { HackathonRepository } from '../database/repositories/hackathon.repository';
import { JuryRepository } from '../database/repositories/jury.repository';
import { CriteriaRepository } from '../database/repositories/criteria.repository';
import { CategoryRepository } from '../database/repositories/category.repository';
import { ParticipationRepository } from '../database/repositories/participation.repository';
import { EvaluationRepository } from '../database/repositories/evaluation.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HackathonStatus } from '@h.linker/libs';

describe('HackathonService', () => {
  let service: HackathonService;
  let hackRepo: any;
  let partRepo: any;
  let criteriaRepo: any;
  let juryRepo: any;
  let evalRepo: any;
  let catRepo: any;

  beforeEach(async () => {
    hackRepo = {
      create: jest.fn(),
      getById: jest.fn(),
      getBySlug: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      findAllPaged: jest.fn(),
      getInsightsData: jest.fn(),
    };
    partRepo = {
      findByTeamAndHackathon: jest.fn(),
      findUserParticipation: jest.fn(),
      create: jest.fn(),
      updateSubmission: jest.fn(),
      findAllSubmissionsByHackathonId: jest.fn(),
      getLeaderboardData: jest.fn(),
      findReviewsByMember: jest.fn(),
    };
    criteriaRepo = { syncCriteria: jest.fn() };
    juryRepo = {
      add: jest.fn(),
      remove: jest.fn(),
      getJuryByUserAndHackathon: jest.fn(),
    };
    evalRepo = {
      upsertScores: jest.fn(),
      getCriteriaByHackathon: jest.fn(),
      getScoresByParticipation: jest.fn(),
      updateParticipationFinalScore: jest.fn(),
      upsertComment: jest.fn(),
    };
    catRepo = { syncHackathonCategories: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackathonService,
        { provide: HackathonRepository, useValue: hackRepo },
        { provide: JuryRepository, useValue: juryRepo },
        { provide: CriteriaRepository, useValue: criteriaRepo },
        { provide: CategoryRepository, useValue: catRepo },
        { provide: ParticipationRepository, useValue: partRepo },
        { provide: EvaluationRepository, useValue: evalRepo },
      ],
    }).compile();

    service = module.get<HackathonService>(HackathonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create: should call repo create', async () => {
    await service.create('u1', { title: 'H1' } as any);
    expect(hackRepo.create).toHaveBeenCalled();
  });

  it('getAll: should call findAllPaged with filters', async () => {
    const query = {
      search: 'AI',
      status: HackathonStatus.ACTIVE,
      order: 'asc',
      categories: ['tech'],
      startDateFrom: new Date('2026-01-01'),
      startDateTo: new Date('2026-12-31'),
    };
    await service.getAll(query as any);
    expect(hackRepo.findAllPaged).toHaveBeenCalled();
  });

  it('getById/Slug: should delegate', async () => {
    await service.getById('1');
    await service.getBySlug('slug');
    expect(hackRepo.getById).toHaveBeenCalled();
    expect(hackRepo.getBySlug).toHaveBeenCalled();
  });

  it('update: should call updateById', async () => {
    await service.update('1', { title: 'Updated' } as any);
    expect(hackRepo.updateById).toHaveBeenCalledWith('1', { title: 'Updated' });
  });

  it('updateStatus: should call updateById with ACTIVE', async () => {
    await service.updateStatus('h1', HackathonStatus.ACTIVE);
    expect(hackRepo.updateById).toHaveBeenCalledWith('h1', {
      status: HackathonStatus.ACTIVE,
    });
  });

  it('deleteById: should delegate', async () => {
    await service.deleteById('1');
    expect(hackRepo.deleteById).toHaveBeenCalledWith('1');
  });

  it('addJuryMember/removeJuryMember: should delegate', async () => {
    await service.addJuryMember('h1', 'u1');
    await service.removeJuryMember('h1', 'u1');
    expect(juryRepo.add).toHaveBeenCalled();
    expect(juryRepo.remove).toHaveBeenCalled();
  });

  it('setCriteria: should throw if weights not 100%', async () => {
    await expect(
      service.setCriteria('h1', [{ id: 'c1', weight: 50 } as any]),
    ).rejects.toThrow(BadRequestException);
  });

  it('setCriteria: should sync if weights = 100%', async () => {
    await service.setCriteria('h1', [{ id: 'c1', weight: 100 } as any]);
    expect(criteriaRepo.syncCriteria).toHaveBeenCalled();
  });

  it('setCategories: should sync even with empty list', async () => {
    await service.setCategories('h1', []);
    expect(catRepo.syncHackathonCategories).toHaveBeenCalledWith('h1', []);
  });

  it('findUserRegistration: should delegate to participationRepository', async () => {
    await service.findUserRegistration('h1', 'u1');
    expect(partRepo.findUserParticipation).toHaveBeenCalledWith('h1', 'u1');
  });

  it('registerTeam: should throw if status is not REGISTRATION', async () => {
    hackRepo.getById.mockResolvedValue({ status: HackathonStatus.FINISHED });
    await expect(service.registerTeam('h1', 't1', 'u1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('registerTeam: should throw if team already registered', async () => {
    hackRepo.getById.mockResolvedValue({
      status: HackathonStatus.REGISTRATION,
    });
    partRepo.findByTeamAndHackathon.mockResolvedValue({ id: 't1' });
    await expect(service.registerTeam('h1', 't1', 'u1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('registerTeam: should throw if user already participating', async () => {
    hackRepo.getById.mockResolvedValue({
      status: HackathonStatus.REGISTRATION,
    });
    partRepo.findByTeamAndHackathon.mockResolvedValue(null);
    partRepo.findUserParticipation.mockResolvedValue({ id: 'p1' });
    await expect(service.registerTeam('h1', 't1', 'u1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('registerTeam: should create participation if valid', async () => {
    hackRepo.getById.mockResolvedValue({
      status: HackathonStatus.REGISTRATION,
    });
    partRepo.findByTeamAndHackathon.mockResolvedValue(null);
    partRepo.findUserParticipation.mockResolvedValue(null);
    await service.registerTeam('h1', 't1', 'u1');
    expect(partRepo.create).toHaveBeenCalledWith('h1', 't1');
  });

  it('submitProject: should throw if status not ACTIVE', async () => {
    hackRepo.getById.mockResolvedValue({ status: HackathonStatus.FINISHED });
    await expect(service.submitProject('h1', 'u1', {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('submitProject: should throw if deadline passed', async () => {
    hackRepo.getById.mockResolvedValue({
      status: HackathonStatus.ACTIVE,
      submissionDeadline: new Date('2000-01-01'),
    });
    await expect(service.submitProject('h1', 'u1', {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('submitProject: should update submission if valid', async () => {
    hackRepo.getById.mockResolvedValue({
      status: HackathonStatus.ACTIVE,
      submissionDeadline: new Date('2100-01-01'),
    });
    partRepo.findUserParticipation.mockResolvedValue({ teamId: 't1' });
    await service.submitProject('h1', 'u1', { repo: 'url' } as any);
    expect(partRepo.updateSubmission).toHaveBeenCalled();
  });

  it('setTeamScores: should throw if jury not found', async () => {
    juryRepo.getJuryByUserAndHackathon.mockResolvedValue(null);
    await expect(
      service.setTeamScores('u1', 'h1', 'p1', { C1: 10 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('setTeamScores: should upsert and calculate correct final score', async () => {
    juryRepo.getJuryByUserAndHackathon.mockResolvedValue({ id: 'j1' });

    evalRepo.getCriteriaByHackathon.mockResolvedValue([
      { id: 'C1', weight: 40 },
      { id: 'C2', weight: 60 },
    ]);

    evalRepo.getScoresByParticipation.mockResolvedValue([
      { juryId: 'j1', criterionId: 'C1', value: 10 },
      { juryId: 'j1', criterionId: 'C2', value: 5 },
    ]);

    await service.setTeamScores('u1', 'h1', 'p1', { C1: 10, C2: 5 });

    expect(evalRepo.upsertScores).toHaveBeenCalledWith('j1', 'p1', {
      C1: 10,
      C2: 5,
    });

    // (10 * 0.4) + (5 * 0.6) = 4 + 3 = 7
    expect(evalRepo.updateParticipationFinalScore).toHaveBeenCalledWith(
      'p1',
      7,
    );
  });

  it('setTeamScores: should early return and not update finalScore if no scores found', async () => {
    juryRepo.getJuryByUserAndHackathon.mockResolvedValue({ id: 'j1' });
    evalRepo.getCriteriaByHackathon.mockResolvedValue([]);
    evalRepo.getScoresByParticipation.mockResolvedValue([]);

    await service.setTeamScores('u1', 'h1', 'p1', {});

    expect(evalRepo.upsertScores).toHaveBeenCalled();
    expect(evalRepo.updateParticipationFinalScore).not.toHaveBeenCalled();
  });

  it('setTeamComment: should throw if jury not found', async () => {
    juryRepo.getJuryByUserAndHackathon.mockResolvedValue(null);
    await expect(
      service.setTeamComment('u1', 'h1', 'p1', { text: 'Bad' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('setTeamComment: should upsert comment if jury exists', async () => {
    juryRepo.getJuryByUserAndHackathon.mockResolvedValue({ id: 'j1' });
    await service.setTeamComment('u1', 'h1', 'p1', { text: 'Great' } as any);
    expect(evalRepo.upsertComment).toHaveBeenCalledWith('j1', 'p1', {
      text: 'Great',
    });
  });

  it('findTeamReviews: should delegate to participationRepository', async () => {
    await service.findTeamReviews('h1', 'u1');
    expect(partRepo.findReviewsByMember).toHaveBeenCalledWith('h1', 'u1');
  });

  it('getHackathonSubmissionsForJury: should delegate', async () => {
    await service.getHackathonSubmissionsForJury('h1');
    expect(partRepo.findAllSubmissionsByHackathonId).toHaveBeenCalledWith('h1');
  });

  it('getLeaderboard: should delegate', async () => {
    await service.getLeaderboard('h1');
    expect(partRepo.getLeaderboardData).toHaveBeenCalledWith('h1');
  });

  it('getInsights: should calculate stats and charts correctly', async () => {
    const mockHack = {
      participations: [
        {
          githubRepoUrl: 'url',
          finalScore: 9,
          updatedAt: new Date('2026-06-01T10:00:00Z'),
          team: { members: [{ roleName: 'DEV' }, { roleName: 'PM' }] },
          scores: [{ createdAt: new Date('2026-06-01T11:00:00Z') }],
        },
        {
          githubRepoUrl: 'url2',
          finalScore: 3,
          updatedAt: new Date('2026-06-01T12:00:00Z'),
          team: { members: [{ roleName: 'DEV' }] },
          scores: [{ createdAt: new Date('2026-06-01T13:00:00Z') }],
        },
      ],
    };
    hackRepo.getInsightsData.mockResolvedValue(mockHack);

    const insights = await service.getInsights('h1');
    expect(insights.stats.totalTeams).toBe(2);
    expect(insights.stats.totalParticipants).toBe(3);
    expect(insights.stats.totalSubmissions).toBe(2);
    expect(insights.stats.averageScore).toBeCloseTo(6.0);

    expect(insights.charts.roleDistribution).toEqual(
      expect.arrayContaining([
        { label: 'DEV', value: 2 },
        { label: 'PM', value: 1 },
      ]),
    );
    expect(insights.charts.scoreDistribution).toEqual(
      expect.arrayContaining([
        { label: '0-2', value: 0 },
        { label: '2-4', value: 1 },
      ]),
    );
    expect(insights.charts.submissionTimeline.length).toBeGreaterThan(0);
    expect(insights.charts.juryActivityTimeline.length).toBeGreaterThan(0);
  });

  it('getInsights: should handle empty participations gracefully', async () => {
    hackRepo.getInsightsData.mockResolvedValue({ participations: [] });
    const insights = await service.getInsights('h1');
    expect(insights.stats.totalTeams).toBe(0);
    expect(insights.stats.totalParticipants).toBe(0);
    expect(insights.stats.totalSubmissions).toBe(0);
    expect(insights.stats.averageScore).toBe(0);
  });
});
