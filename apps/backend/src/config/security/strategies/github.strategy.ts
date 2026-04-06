import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import config from '../../config';
import { AuthService } from '../../../app/services/auth.service';
import { VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.github.clientID,
      clientSecret: configService.github.clientSecret,
      callbackURL: configService.github.callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { displayName, username, emails, photos } = profile;

    const nameParts = displayName ? displayName.split(' ') : [username, ''];

    const user = await this.authService.validateGoogleUser({
      email: emails[0].value,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      avatarUrl: photos[0].value,
      password: '',
    });

    done(null, user);
  }
}
