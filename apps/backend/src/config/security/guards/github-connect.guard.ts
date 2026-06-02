import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubConnectGuard extends AuthGuard('github') {
  constructor(private configService: ConfigService) {
    super();
  }

  override getAuthenticateOptions() {
    return {
      callbackURL: this.configService.get<string>(
        'config.github.connectCallbackURL',
      ),
    };
  }

  override handleRequest<TUser = User>(
    err: Error | null,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const response: Response = context.switchToHttp().getResponse();
    const clientUrl = this.configService.get<string>('config.clientUrl');

    if (err || !user) {
      const error = err as unknown as {
        response?: { message?: string };
        message?: string;
      };
      const errorMessage =
        error?.response?.message || error?.message || 'Connection failed';

      response.redirect(
        `${clientUrl}/profile/settings?error=${encodeURIComponent(errorMessage)}`,
      );

      return null;
    }

    return user;
  }
}
