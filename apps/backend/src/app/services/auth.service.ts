import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO, RegisterDTO, UpdatePasswordDTO } from '@h.linker/libs';
import { Response } from 'express';
import { NotRegisteredException } from '../utils/exceptions/not-registered.exception';
import { PasswordRepeatException } from '../utils/exceptions/password-repeat.exception';
import { InvalidPasswordException } from '../utils/exceptions/invalid-password-exception';
import { User } from '@prisma/client';
import config from '../../config/config';
import { ConfigType } from '@nestjs/config';
import { GithubUser, ExternalUser } from '../utils/external-users';
import { CategoryService } from './category.service';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private jwtService: JwtService,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
  ) {}

  async register(dto: RegisterDTO): Promise<User> {
    await this.userService.checkEmailUniqueness(dto.email);
    await this.userService.checkUsernameUniqueness(dto.username);

    return this.userService.create(dto);
  }

  private async validatePassword(
    password: string,
    userPassword: string,
  ): Promise<void> {
    const isPasswordsMatch = await bcrypt.compare(password, userPassword);
    if (!isPasswordsMatch) throw new InvalidPasswordException();
  }

  getToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }

  async login({ email, password }: LoginDTO): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotRegisteredException();

    await this.validatePassword(password, user.password);
    return this.getToken(user.id);
  }

  async validateGoogleUser(externalUser: ExternalUser): Promise<User> {
    let user = await this.userService.findByEmail(externalUser.email);

    if (!user) {
      user = await this.userService.create(externalUser);
    }

    return user;
  }

  async validateGithubUser(
    { skills, ...gitHub }: GithubUser,
    currentUser?: User,
  ): Promise<User> {
    const user = currentUser
      ? await this.handleAccountLinking(currentUser, gitHub.githubId)
      : await this.handleGithubAuth(gitHub);

    if (skills?.length) {
      this.categoryService
        .syncUserSkills(user.id, skills)
        .catch((err) => console.error('GitHub Skills sync failed:', err));
    }

    return user;
  }

  private async handleAccountLinking(
    user: User,
    githubId: string,
  ): Promise<User> {
    const linkedUser = await this.userService.findByGithubId(githubId);

    if (linkedUser && linkedUser.id !== user.id) {
      throw new ConflictException(
        'This GitHub account is already linked to another user',
      );
    }

    return this.userService.updateGithubId(user.id, githubId);
  }

  private async handleGithubAuth(data: GithubUser): Promise<User> {
    let user = await this.userService.findByGithubId(data.githubId);
    if (user) return user;

    user = await this.userService.findByEmail(data.email);
    if (user) {
      return this.userService.updateGithubId(user.id, data.githubId);
    }

    return this.userService.create(data);
  }

  setToken(userId: string, res: Response): void {
    const token = this.jwtService.sign({
      sub: userId,
    });

    res.cookie('access_token', token);
    res.redirect(this.configService.clientUrl);
  }

  async deleteMe(userId: string): Promise<void> {
    await this.userService.delete(userId);
  }

  async updatePassword(
    userId: string,
    { oldPassword, newPassword }: UpdatePasswordDTO,
  ): Promise<void> {
    const user = await this.userService.findById(userId);
    if (user.password) {
      await this.validatePassword(oldPassword, user.password);
    }

    if (oldPassword === newPassword) {
      throw new PasswordRepeatException();
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(userId, hashedPassword);
  }
}
