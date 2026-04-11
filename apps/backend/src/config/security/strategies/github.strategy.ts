import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { Request } from 'express';
import config from '../../config';
import { AuthService } from '../../../app/services/auth.service';
import { GithubService } from '../../../app/services/github.service';
import { User } from '@prisma/client';

interface ExtendedGitHubProfile extends Profile {
  _json: {
    bio?: string;
  };
}

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
    profile: ExtendedGitHubProfile,
    done: (err: Error | null, user?: User | null) => void,
  ): Promise<void> {
    try {
      const { id, username, displayName, emails, photos, _json } = profile;

      const bio = _json.bio;

      const rawName = displayName || username;
      const nameParts = rawName.split(' ');

      const { skills } = await this.githubService.getProfileData(accessToken, username);
      const authenticatedUser = req.user as User | undefined;

      const user = await this.authService.validateGithubUser(
        {
          githubId: id,
          email: emails?.[0]?.value,
          username,
          githubUsername: username,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || '',
          avatarUrl: photos?.[0]?.value,
          bio: bio || '',
          password: '',
          skills: skills,
        },
        authenticatedUser,
      );

      done(null, user);
    } catch (error) {
      done(error instanceof Error ? error : new Error(String(error)), null);
    }
  }
}
