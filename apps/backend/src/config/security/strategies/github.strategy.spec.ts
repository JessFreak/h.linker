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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate and return user with full profile data', async () => {
    const mockProfile = {
      id: 'gh-1',
      username: 'jess',
      displayName: 'Jess Freak',
      emails: [{ value: 'jess@kpi.ua' }],
      photos: [{ value: 'url' }],
      _json: { bio: 'dev' },
    } as any;

    const req = {} as any;
    const done = jest.fn();
    mockAuthService.validateGithubUser.mockResolvedValue({ id: 'u1' });

    await strategy.validate(req, 'token', '', mockProfile, done);

    expect(mockAuthService.validateGithubUser).toHaveBeenCalledWith(
      expect.objectContaining({
        githubId: 'gh-1',
        username: 'jess',
        firstName: 'Jess',
        lastName: 'Freak',
        email: 'jess@kpi.ua',
        avatarUrl: 'url',
        bio: 'dev',
      }),
      undefined, // req.user is undefined
    );
    expect(done).toHaveBeenCalledWith(null, { id: 'u1' });
  });

  it('should handle missing optional profile fields and authenticated user', async () => {
    const mockProfile = {
      id: 'gh-2',
      username: 'lonewolf',
      _json: {},
    } as any;

    // Імітуємо ситуацію, коли користувач вже авторизований
    const req = { user: { id: 'existing-user' } } as any;
    const done = jest.fn();
    mockAuthService.validateGithubUser.mockResolvedValue({ id: 'u2' });

    await strategy.validate(req, 'token', '', mockProfile, done);

    expect(mockAuthService.validateGithubUser).toHaveBeenCalledWith(
      expect.objectContaining({
        githubId: 'gh-2',
        username: 'lonewolf',
        firstName: 'lonewolf',
        lastName: '',
        email: undefined,
        avatarUrl: undefined,
        bio: '',
      }),
      { id: 'existing-user' },
    );
    expect(done).toHaveBeenCalledWith(null, { id: 'u2' });
  });

  it('should catch and pass standard Error to done callback', async () => {
    const mockProfile = {
      id: 'gh-3',
      username: 'error_user',
      _json: {},
    } as any;
    const done = jest.fn();

    const standardError = new Error('GitHub API failed');
    mockGithubService.getProfileData.mockRejectedValue(standardError);

    await strategy.validate({} as any, 'token', '', mockProfile, done);

    expect(done).toHaveBeenCalledWith(standardError, null);
  });

  it('should catch non-Error exceptions and wrap them in an Error', async () => {
    const mockProfile = {
      id: 'gh-4',
      username: 'string_error',
      _json: {},
    } as any;
    const done = jest.fn();

    mockGithubService.getProfileData.mockRejectedValue(
      'Some weird string error',
    );

    await strategy.validate({} as any, 'token', '', mockProfile, done);

    expect(done).toHaveBeenCalledWith(
      new Error('Some weird string error'),
      null,
    );
  });
});
