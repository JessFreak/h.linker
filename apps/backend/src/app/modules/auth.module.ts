import { Global, Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import config from '../../config/config';
import { AuthService } from '../services/auth.service';
import { GoogleOauthGuard } from '../../config/security/guards/google-oauth.guard';
import { JwtAuthGuard } from '../../config/security/guards/jwt-auth.guard';
import { GoogleStrategy } from '../../config/security/strategies/google.strategy';
import { ConfigType } from '@nestjs/config';
import { GithubStrategy } from '../../config/security/strategies/github.strategy';
import { GithubOauthGuard } from '../../config/security/guards/github-oauth.guard';
import { CategoryModule } from './category.module';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => ({
        secret: configService.secret,
        signOptions: {
          expiresIn: configService.signOptions.expiresIn as never,
        },
      }),
    }),
    CategoryModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleOauthGuard,
    GithubOauthGuard,
    JwtAuthGuard,
    GoogleStrategy,
    GithubStrategy,
  ],
  exports: [
    AuthService,
    GoogleOauthGuard,
    GithubOauthGuard,
    JwtAuthGuard,
    GoogleStrategy,
    GithubStrategy,
  ],
})
export class AuthModule {}