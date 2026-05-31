import 'reflect-metadata';
import { GithubStrategy } from './github.strategy';

describe('GithubStrategy', () => {
  let strategy: GithubStrategy;
  let mockAuthService: any;
  let mockGithubService: any;
  let mockConfig: any;

  beforeEach(() => {
    mockAuthService = { validateGithubUser: jest.fn() };
    mockGithubService = {
      getProfileData: jest.fn().mockResolvedValue({ skills: [] }),
    };
    mockConfig = {
      github: { clientID: '1', clientSecret: '2', callbackURL: '3' },
    };

    strategy = new GithubStrategy(
      mockConfig,
      mockAuthService,
      mockGithubService,
    );
  });

  it('should validate and return user', async () => {
    const mockProfile = {
      id: 'gh-1',
      username: 'jess',
      displayName: 'Jess Freak',
      emails: [{ value: 'jess@kpi.ua' }],
      photos: [{ value: 'url' }],
      _json: { bio: 'dev' },
    } as any;

    const done = jest.fn();
    mockAuthService.validateGithubUser.mockResolvedValue({ id: 'u1' });

    await strategy.validate({} as any, 'token', '', mockProfile, done);

    expect(mockAuthService.validateGithubUser).toHaveBeenCalledWith(
      expect.objectContaining({ githubId: 'gh-1', username: 'jess' }),
      undefined,
    );
    expect(done).toHaveBeenCalledWith(null, { id: 'u1' });
  });
});
