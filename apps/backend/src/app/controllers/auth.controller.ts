import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { GoogleOauthGuard } from '../../config/security/guards/google-oauth.guard';
import { LoginDTO, RegisterDTO, UpdatePasswordDTO } from '@h.linker/libs';
import { UserRequest } from '../../config/security/decorators/user-request';
import { User } from '@prisma/client';
import { Access } from '../../config/security/decorators/acces';
import { ConfigType } from '@nestjs/config';
import config from '../../config/config';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  auth(): void {
    /* empty */
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  googleAuthCallback(
    @UserRequest() user: User,
    @Res({ passthrough: true }) res: Response,
  ): void {
    const token = this.authService.getToken(user.id);

    res.cookie('access_token', token, { httpOnly: true });
    res.redirect(`${this.configService.clientUrl}?auth=success`);
  }

  @Post('register')
  async register(@Body() body: RegisterDTO): Promise<void> {
    await this.authService.register(body);
  }

  @Post('login')
  async login(
    @Body() body: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const token = await this.authService.login(body);

    res.cookie('access_token', token, { httpOnly: true });
    return { message: 'Success' };
  }

  @Access()
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }

  @Access()
  @Get('me')
  getMe(@UserRequest() user: User): User {
    return user;
  }

  @Access()
  @Delete('me')
  async deleteMe(
    @UserRequest() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.authService.deleteMe(user.id);
    res.clearCookie('access_token');
    return { message: 'Account deleted' };
  }

  @Access()
  @Patch('password')
  async updatePassword(
    @UserRequest() user: User,
    @Body() body: UpdatePasswordDTO,
  ): Promise<void> {
    return this.authService.updatePassword(user.id, body);
  }
}
