import config from './config';

describe('App Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      GOOGLE_CLIENT_ID: 'google_id',
      GOOGLE_CLIENT_SECRET: 'google_secret',
      GOOGLE_CALLBACK_URL: 'google_callback',
      GITHUB_CLIENT_ID: 'github_id',
      GITHUB_CLIENT_SECRET: 'github_secret',
      GITHUB_CALLBACK_URL: 'github_callback',
      GITHUB_SYSTEM_TOKEN: 'github_token',
      JWT_SECRET: 'super_secret',
      JWT_EXPIRE: '1d',
      CLIENT_URL: 'http://localhost:3000',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return the correct configuration object based on process.env', () => {
    const result = config();

    expect(result).toEqual({
      google: {
        clientID: 'google_id',
        clientSecret: 'google_secret',
        callbackURL: 'google_callback',
      },
      github: {
        clientID: 'github_id',
        clientSecret: 'github_secret',
        callbackURL: 'github_callback',
        systemToken: 'github_token',
      },
      secret: 'super_secret',
      signOptions: {
        expiresIn: '1d',
      },
      clientUrl: 'http://localhost:3000',
    });
  });
});
