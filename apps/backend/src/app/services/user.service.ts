import { NotRegisteredException } from '../utils/exceptions/not-registered.exception';
import { AlreadyExistsException } from '../utils/exceptions/already-exists.exception';
import {
  RegisterDTO,
  UpdateUserDTO,
  UserQueryDTO,
  UserResponse,
} from '@h.linker/libs';
import { ExternalUser } from '../utils/external-users';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../database/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { CategoryService } from './category.service';
import { FullUser, UserWithSkills } from '../database/entities/user.entity';

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

  async findByUsername(
    username: string,
    full = false,
  ): Promise<FullUser | User> {
    return this.userRepository.findByUsername(username, full);
  }

  async findById(id: string): Promise<UserWithSkills> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotRegisteredException();
    return user;
  }

  async getAll(query: UserQueryDTO, currentUser?: UserResponse) {
    const {
      search,
      categories,
      connectedGithub,
      order,
      isRecommended,
      excludeSelf,
    } = query;

    const where: Prisma.UserWhereInput = {
      ...(excludeSelf && currentUser && { id: { not: currentUser.id } }),

      ...(categories &&
        categories.length > 0 && {
          skills: { some: { category: { in: categories } } },
        }),
      ...(connectedGithub && {
        githubId: { not: null },
      }),
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    if (isRecommended && currentUser?.id) {
      return this.userRepository.findRecommendedPaged(
        query,
        where,
        currentUser.skills || [],
      );
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      username: order ?? 'asc',
    };

    return this.userRepository.findAllPaged(query, where, orderBy);
  }

  async findByGithubId(githubId: string): Promise<User> {
    return this.userRepository.findByGithubId(githubId);
  }

  async updateGithub(
    userId: string,
    githubId: string,
    githubUsername: string,
  ): Promise<UserWithSkills> {
    return this.userRepository.updateById(userId, { githubId, githubUsername });
  }

  async updatePassword(
    userId: string,
    hashedPass: string,
  ): Promise<UserWithSkills> {
    return this.userRepository.updateById(userId, { password: hashedPass });
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDTO,
  ): Promise<UserWithSkills> {
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
      throw new AlreadyExistsException('User', 'email');
    }
  }

  async checkUsernameUniqueness(
    username: string,
    userId?: string,
  ): Promise<void> {
    const user = await this.userRepository.findByUsername(username);
    if (user && user.id !== userId) {
      throw new AlreadyExistsException('User', 'username');
    }
  }
}
