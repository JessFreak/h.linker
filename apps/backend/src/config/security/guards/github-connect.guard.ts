import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class GithubConnectGuard extends AuthGuard('github') {
  override getAuthenticateOptions() {
    return {
      callbackURL: 'http://localhost:3000/api/auth/github/connect/callback',
    };
  }

  override handleRequest<TUser = User>(
    err: Error | null,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const response: Response = context.switchToHttp().getResponse();

    if (err || !user) {
      const error = err as unknown as {
        response?: { message?: string };
        message?: string;
      };
      const errorMessage =
        error?.response?.message || error?.message || 'Connection failed';

      response.redirect(
        `http://localhost:4200/profile/settings?error=${encodeURIComponent(errorMessage)}`,
      );

      return null;
    }

    return user;
  }
}
