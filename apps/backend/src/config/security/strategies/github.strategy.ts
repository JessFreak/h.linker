import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import config from '../../config';
import { AuthService } from '../../../app/services/auth.service';
import { VerifyCallback } from 'passport-google-oauth2';
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
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { username, displayName, emails, photos, _json } = profile;

    const nameToSplit = displayName || username || _json.login;
    const nameParts = nameToSplit.split(' ');

    const skillsMap = await this.githubService.fetchUserSkills(accessToken);
    const skillNames = Object.keys(skillsMap);

    const user = await this.authService.validateExternalUser({
      email: emails[0].value,
      username: username,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || '',
      avatarUrl: photos[0]?.value || _json.avatar_url,
      bio: _json.bio || '',
      password: '',
      skills: skillNames,
    });

    done(null, user);
  }
}
