import 'reflect-metadata';
import { GithubConnectGuard } from './github-connect.guard';
import { ExecutionContext } from '@nestjs/common';

describe('GithubConnectGuard', () => {
  let guard: GithubConnectGuard;

  beforeEach(() => {
    guard = new GithubConnectGuard();
  });

  it('should redirect to settings with error when authentication fails', () => {
    const mockRedirect = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ redirect: mockRedirect }),
      }),
    } as any;

    const error = new Error('GitHub connection failed');

    const result = guard.handleRequest(
      error,
      null,
      null,
      context as ExecutionContext,
    );

    // аутентифікація не вдалася
    expect(result).toBeNull();

    expect(mockRedirect).toHaveBeenCalled();
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl).toContain('profile/settings');
    expect(redirectUrl).toContain('error=GitHub%20connection%20failed');
  });

  it('should return user if authentication is successful', () => {
    const mockUser = { id: 'u1' };

    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ redirect: jest.fn() }),
        getRequest: () => ({}),
      }),
    } as any;

    const result = guard.handleRequest(null, mockUser, null, context);

    expect(result).toBe(mockUser);
  });

  it('should provide correct authenticate options', () => {
    const options = guard.getAuthenticateOptions();
    expect(options.callbackURL).toBe(
      'http://localhost:3000/api/auth/github/connect/callback',
    );
  });
});
