import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  auth(): void { /* empty */ }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  googleAuthCallback(@UserRequest() user: User, @Res() res: Response): void {
    this.authService.setToken(user.id, res);
  }

  @Post('register')
  async register(@Body() body: RegisterDTO): Promise<void> {
    await this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginDTO) {
    const { id } = await this.authService.login(body);
    const token = this.authService.getToken(id);

    return { token };
  }

  @Access()
  @Post('logout')
  logout(@Res() res: Response): Response {
    return this.authService.logout(res);
  }

  @Access()
  @Get('me')
  getMe(@UserRequest() user: User): User {
    return user;
  }

  @Access()
  @Delete('me')
  deleteMe(@UserRequest() user: User, @Res() res: Response): Promise<Response> {
    return this.authService.deleteMe(user.id, res);
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
