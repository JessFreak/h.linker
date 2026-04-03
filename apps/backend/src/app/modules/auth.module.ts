import { Global, Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import config from '../../config/config';
import { AuthService } from '../services/auth.service';
import { GoogleOauthGuard } from '../../config/security/guards/google-oauth.guard';
import { JwtAuthGuard } from '../../config/security/guards/jwt-auth.guard';
import { GoogleStrategy } from '../../config/security/strategies/google.strategy';
import { ConfigType } from '@nestjs/config';

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
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleOauthGuard, JwtAuthGuard, GoogleStrategy],
  exports: [AuthService, GoogleOauthGuard, JwtAuthGuard, GoogleStrategy],
})
export class AuthModule {}