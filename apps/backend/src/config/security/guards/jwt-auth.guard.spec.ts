import 'reflect-metadata';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  it('should throw UnauthorizedException if no token is provided', async () => {
    const mockJwt = {} as any;
    const mockRepo = {} as any;
    const guard = new JwtAuthGuard(mockJwt, mockRepo);

    const context = {
      switchToHttp: () => ({ getRequest: () => ({ cookies: {} }) }),
    } as any;

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
