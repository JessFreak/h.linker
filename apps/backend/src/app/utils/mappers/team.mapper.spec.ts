import 'reflect-metadata';
import { TeamMapper } from './team.mapper';
import { ParticipationMapper } from './participation.mapper';
import { MemberStatus } from '@h.linker/libs';

describe('TeamMapper Full Coverage', () => {
  beforeEach(() => {
    jest
      .spyOn(ParticipationMapper, 'getTeamParticipationsListResponse')
      .mockReturnValue([]);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should return null if team is null in getTeamResponse', () => {
    const result = TeamMapper.getTeamResponse(null as any);
    expect(result).toBeNull();
  });

  it('should handle team with no members and no participations', () => {
    const mockTeam = {
      id: 't1',
      name: 'Empty Team',
      leaderId: 'u1',
      members: [],
      participations: [],
    } as any;

    const result = TeamMapper.getTeamResponse(mockTeam);

    expect(result.members).toEqual([]);
    expect(result.requests).toEqual([]);
    expect(result.participations).toEqual([]);
  });

  it('should map multiple teams in getTeamsResponse', () => {
    const mockTeams = [
      { id: '1', name: 'T1', members: [], participations: [] },
      { id: '2', name: 'T2', members: [], participations: [] },
    ] as any;

    const result = TeamMapper.getTeamsResponse(mockTeams);
    expect(result.teams).toHaveLength(2);
    expect(result.teams[0].name).toBe('T1');
  });

  it('should map invitations correctly', () => {
    const mockInvitations = [
      {
        teamId: 't1',
        team: { name: 'Super Team' },
        roleName: 'Designer',
        message: 'Join us!',
        created: new Date(),
      },
    ] as any;

    const result = TeamMapper.getInvitationsResponse(mockInvitations);

    expect(result.invitations).toHaveLength(1);
    expect(result.invitations[0].teamName).toBe('Super Team');
    expect(result.invitations[0].roleName).toBe('Designer');
  });

  it('should correctly separate accepted members from other request types', () => {
    jest
      .spyOn(require('./user.mapper').UserMapper, 'getUserResponse')
      .mockImplementation((u: any) => ({
        id: u.id,
        username: u.username,
      }));

    const mockTeam = {
      id: 't1',
      name: 'Split Team',
      members: [
        {
          status: MemberStatus.ACCEPTED,
          user: { id: 'u1', username: 'alice' },
          roleName: 'Admin',
        },
        {
          status: MemberStatus.PENDING,
          user: { id: 'u2', username: 'bob' },
          roleName: 'Member',
        },
        {
          status: MemberStatus.REJECTED,
          user: { id: 'u3', username: 'charlie' },
          roleName: 'Guest',
        },
      ],
    } as any;

    const result = TeamMapper.getTeamResponse(mockTeam);

    // Перевірка розділення: ACCEPTED -> members, PENDING/REJECTED -> requests
    expect(result.members).toHaveLength(1);
    expect(result.members[0].username).toBe('alice');

    expect(result.requests).toHaveLength(2);
    expect(result.requests.map((r) => r.username)).toContain('bob');
    expect(result.requests.map((r) => r.username)).toContain('charlie');
  });

  it('should map participations list correctly', () => {
    const spy = jest
      .spyOn(ParticipationMapper, 'getTeamParticipationsListResponse')
      .mockReturnValue([{ id: 'p1', hackathonTitle: 'Hack1' } as any]);

    const mockTeam = {
      id: 't1',
      members: [],
      participations: [{ id: 'p1' }],
    } as any;

    const result = TeamMapper.getTeamResponse(mockTeam);

    expect(spy).toHaveBeenCalledWith(mockTeam.participations);
    expect(result.participations).toHaveLength(1);
    expect(result.participations[0].hackathonTitle).toBe('Hack1');
  });
});
