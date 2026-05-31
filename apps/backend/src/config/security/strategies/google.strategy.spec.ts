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

  it('should validate and create username from email', async () => {
    const mockProfile = {
      email: 'my.name@gmail.com',
      name: { givenName: 'My', familyName: 'Name' },
      picture: 'pic.jpg',
    } as any;

    const done = jest.fn();
    mockAuthService.validateGoogleUser.mockResolvedValue({ id: 'u2' });

    await strategy.validate('', '', mockProfile, done);

    // Перевірка, чи правильно спрацював алгоритм генерації username (регекс)
    expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'myname' }),
    );
    expect(done).toHaveBeenCalledWith(null, { id: 'u2' });
  });
});
