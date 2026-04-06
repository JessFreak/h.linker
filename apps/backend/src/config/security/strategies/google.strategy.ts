import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import config from '../../config';
import { AuthService } from '../../../app/services/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.google.clientID,
      clientSecret: configService.google.clientSecret,
      callbackURL: configService.google.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, email, picture } = profile;
    const username = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    const user = this.authService.validateExternalUser({
      email,
      username,
      firstName: name.givenName,
      lastName: name.familyName,
      avatarUrl: picture,
      password: '',
    });

    done(null, user);
  }
}
