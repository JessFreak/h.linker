import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../database/repositories/user.repository';
import { LoginDTO, RegisterDTO, UpdatePasswordDTO } from '@h.linker/libs';
import { Response } from 'express';
import { AlreadyRegisteredException } from '../utils/exceptions/already-registered.exception';
import { NotRegisteredException } from '../utils/exceptions/not-registered.exception';
import { PasswordRepeatException } from '../utils/exceptions/password-repeat.exception';
import { InvalidPasswordException } from '../utils/exceptions/invalid-password-exception';
import { User } from '@prisma/client';
import config from '../../config/config';
import { ConfigType } from '@nestjs/config';
import { GithubUser, ExternalUser } from '../utils/external-users';
import { CategoryService } from './category.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly categoryService: CategoryService,
  ) {}

  async register(user: RegisterDTO): Promise<User> {
    await this.checkIfEmailExist(user);
    await this.checkIfUsernameExist(user.username);

    const hashedPassword = await bcrypt.hash(user.password, 10);

    return this.userRepository.create({
      ...user,
      password: hashedPassword,
    });
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
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotRegisteredException();

    await this.validatePassword(password, user.password);
    return this.getToken(user.id);
  }

  async validateExternalUser(
    externalUser: ExternalUser | GithubUser,
  ): Promise<User> {
    let user = await this.userRepository.findByEmail(externalUser.email);

    const { skills, ...userData } = externalUser as GithubUser;

    if (!user) {
      user = await this.userRepository.create(userData);
    }
    if (skills?.length) {
      this.categoryService
        .syncUserSkills(user.id, skills)
        .catch((err) => console.error('Skills sync failed:', err));
    }

    return user;
  }

  setToken(userId: string, res: Response): void {
    const token = this.jwtService.sign({
      sub: userId,
    });

    res.cookie('access_token', token);
    res.redirect(this.configService.clientUrl);
  }

  async deleteMe(userId: string): Promise<void> {
    await this.userRepository.deleteById(userId);
  }

  async updatePassword(
    userId: string,
    { oldPassword, newPassword }: UpdatePasswordDTO,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user.password) {
      await this.validatePassword(oldPassword, user.password);
    }

    if (oldPassword === newPassword) {
      throw new PasswordRepeatException();
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updateById(userId, { password: hashedPassword });
  }

  async checkIfEmailExist({ email }: LoginDTO, userId?: string): Promise<void> {
    const emailExist = await this.userRepository.findByEmail(email);
    if (emailExist && emailExist.id !== userId) {
      throw new AlreadyRegisteredException('User', 'email');
    }
  }

  async checkIfUsernameExist(username: string): Promise<void> {
    const exist = await this.userRepository.findByUsername(username);
    if (exist) {
      throw new AlreadyRegisteredException('User', 'username');
    }
  }
}
