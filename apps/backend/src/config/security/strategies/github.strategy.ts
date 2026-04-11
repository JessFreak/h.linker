import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Request } from 'express';
import config from '../../config';
import { AuthService } from '../../../app/services/auth.service';
import { GithubService } from '../../../app/services/github.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private readonly authService: AuthService,
    private readonly githubService: GithubService,
  ) {
    super({
      clientID: configService.github.clientID,
      clientSecret: configService.github.clientSecret,
      callbackURL: configService.github.callbackURL,
      scope: ['user:email'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: any, user?: any, info?: any) => void,
  ): Promise<void> {
    try {
      const { id, username, displayName, emails, photos, _json } = profile;
      const nameParts = (displayName || username || _json.login).split(' ');

      const skillsMap = await this.githubService.fetchUserSkills(accessToken);
      const skillNames = Object.keys(skillsMap);

      const authenticatedUser = (req as any).user;

      const user = await this.authService.validateGithubUser(
        {
          githubId: id,
          email: emails[0].value,
          username: username || _json.login,
          githubUsername: username || _json.login,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || '',
          avatarUrl: photos[0]?.value || _json.avatar_url,
          bio: _json.bio || '',
          password: '',
          skills: skillNames,
        },
        authenticatedUser,
      );

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
