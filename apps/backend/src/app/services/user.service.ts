import { NotRegisteredException } from '../utils/exceptions/not-registered.exception';
import { AlreadyRegisteredException } from '../utils/exceptions/already-registered.exception';
import { RegisterDTO, UpdateUserDTO } from '@h.linker/libs';
import { ExternalUser } from '../utils/external-users';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../database/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CategoryService } from './category.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly categoryService: CategoryService,
  ) {}

  async create(data: RegisterDTO | ExternalUser): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.userRepository.create(data);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findByUsername(username);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotRegisteredException();
    return user;
  }

  async find(): Promise<User[]> {
    return this.userRepository.find({});
  }

  async findByGithubId(githubId: string): Promise<User> {
    return this.userRepository.findByGithubId(githubId);
  }

  async updateGithubId(userId: string, githubId: string): Promise<User> {
    return this.userRepository.updateById(userId, { githubId });
  }

  async updatePassword(userId: string, hashedPass: string): Promise<User> {
    return this.userRepository.updateById(userId, { password: hashedPass });
  }

  async updateProfile(userId: string, dto: UpdateUserDTO): Promise<User> {
    if (dto.username) {
      await this.checkUsernameUniqueness(dto.username, userId);
    }

    const { skills, ...user } = dto;

    if (skills) {
      await this.categoryService.deleteUserSkills(userId);
      await this.categoryService.syncUserSkills(userId, skills);
    }

    return this.userRepository.updateById(userId, user);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  async checkEmailUniqueness(email: string, userId?: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (user && user.id !== userId) {
      throw new AlreadyRegisteredException('User', 'email');
    }
  }

  async checkUsernameUniqueness(
    username: string,
    userId?: string,
  ): Promise<void> {
    const user = await this.userRepository.findByUsername(username);
    if (user && user.id !== userId) {
      throw new AlreadyRegisteredException('User', 'username');
    }
  }
}
