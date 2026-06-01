import 'reflect-metadata';
import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let mockAuthService: any;
  let mockConfig: any;

  beforeEach(() => {
    mockAuthService = { validateGoogleUser: jest.fn() };
    mockConfig = {
      google: { clientID: '1', clientSecret: '2', callbackURL: '3' },
    };

    strategy = new GoogleStrategy(mockConfig, mockAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate and create username from email', async () => {
    const mockProfile = {
      email: 'my.name@gmail.com',
      name: { givenName: 'My', familyName: 'Name' },
      picture: 'pic.jpg',
    } as any;

    const done = jest.fn();
    mockAuthService.validateGoogleUser.mockResolvedValue({ id: 'u2' });

    await strategy.validate('', '', mockProfile, done);

    expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'myname' }),
    );
    expect(done).toHaveBeenCalledWith(null, { id: 'u2' });
  });

  it('should catch and pass standard Error to done callback', async () => {
    const mockProfile = {
      email: 'error@gmail.com',
      name: { givenName: 'Err', familyName: 'Or' },
      picture: '',
    } as any;
    const done = jest.fn();

    const standardError = new Error('Google Auth failed');
    mockAuthService.validateGoogleUser.mockRejectedValue(standardError);

    await strategy.validate('', '', mockProfile, done);

    expect(done).toHaveBeenCalledWith(standardError, null);
  });

  it('should catch non-Error exceptions and wrap them in an Error', async () => {
    const mockProfile = {
      email: 'string@gmail.com',
      name: { givenName: 'Str', familyName: 'Ing' },
      picture: '',
    } as any;
    const done = jest.fn();

    mockAuthService.validateGoogleUser.mockRejectedValue(
      'Some weird string error',
    );

    await strategy.validate('', '', mockProfile, done);

    expect(done).toHaveBeenCalledWith(
      new Error('Some weird string error'),
      null,
    );
  });
});
