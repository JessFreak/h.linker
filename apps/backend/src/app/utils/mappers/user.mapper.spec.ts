import 'reflect-metadata';
import { UserMapper } from './user.mapper';
import { TeamMapper } from './team.mapper';
import { HackathonMapper } from './hackathon.mapper';
import { ParticipationMapper } from './participation.mapper';
import { HackathonStatus } from '@h.linker/libs';

describe('UserMapper Full Coverage', () => {
  beforeEach(() => {
    jest
      .spyOn(TeamMapper, 'getDetailResponse')
      .mockImplementation((t: any) => ({
        id: t.id,
        name: t.name || 'Mock Team',
        leaderId: t.leaderId || 'user-1',
        description: t.description || null,
        communicationLink: t.communicationLink || null,
      }));

    jest
      .spyOn(HackathonMapper, 'mapBasicInfo')
      .mockImplementation((h: any) => ({
        id: h.id,
        title: h.title || 'Mock Hack',
        slug: h.slug || 'mock-hack',
        description: h.description || '',
        prize: h.prize || '',
        status: HackathonStatus.REGISTRATION,
        imageUrl: h.imageUrl || null,
        registrationStartDate: new Date().toISOString(),
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        submissionDeadline: new Date().toISOString(),
      }));

    jest
      .spyOn(ParticipationMapper, 'getTeamParticipationsListResponse')
      .mockReturnValue([]);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should map full user response with teams, projects and created hackathons', () => {
    const mockFullUser = {
      id: 'u1',
      username: 'johndoe',
      memberships: [
        {
          roleName: 'Lead',
          team: {
            id: 't1',
            participations: [
              { projectTitle: 'App', hackathon: { title: 'H1' } },
            ],
          },
        },
      ],
      createdHackathons: [{ id: 'h1' }],
    } as any;

    const result = UserMapper.getFullUserResponse(mockFullUser);

    expect(result.teams).toHaveLength(1);
    expect(result.teams[0].userRole).toBe('Lead');

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].hackathonTitle).toBe('H1');

    expect(result.createdHackathons).toHaveLength(1);
    expect(result.createdHackathons[0].id).toBe('h1');
  });

  it('should handle empty arrays in memberships and hackathons', () => {
    const mockEmptyUser = {
      id: 'u2',
      memberships: [],
      createdHackathons: [],
    } as any;

    const result = UserMapper.getFullUserResponse(mockEmptyUser);

    expect(result.teams).toEqual([]);
    expect(result.projects).toEqual([]);
    expect(result.createdHackathons).toEqual([]);
  });

  it('should map multiple users array correctly', () => {
    const users = [
      { id: '1', username: 'u1' },
      { id: '2', username: 'u2' },
    ] as any;

    const result = UserMapper.getUsersResponse(users);

    expect(result.users).toHaveLength(2);
    expect(result.users[0].id).toBe('1');
    expect(result.users[1].id).toBe('2');
  });
});
