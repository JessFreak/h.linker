import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GithubConnectGuard extends AuthGuard('github') {
  override getAuthenticateOptions(context: any) {
    return {
      callbackURL: 'http://localhost:3000/api/auth/github/connect/callback',
    };
  }

  handleRequest(err, user, info, context) {
    const response = context.switchToHttp().getResponse();
    if (err) {
      const errorMessage =
        err?.response?.message || err?.message || 'Connection failed';
      response.redirect(
        `http://localhost:4200/profile/settings?error=${encodeURIComponent(errorMessage)}`,
      );
      return null;
    }
    return user;
  }
}
