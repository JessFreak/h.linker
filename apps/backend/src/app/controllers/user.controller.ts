import { Body, Controller, Get, Inject, Param, Patch } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Access } from '../../config/security/decorators/acces';
import { UserRequest } from '../../config/security/decorators/user-request';
import {
  FullUserResponse,
  UpdateUserDTO,
  UserResponse,
  UsersResponse,
} from '@h.linker/libs';
import { UserMapper } from '../utils/mappers/user.mapper';
import { FullUser } from '../database/entities/user.entity';
import { ConfigType } from '@nestjs/config';
import { GithubService } from '../services/github.service';
import config from '../../config/config';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private readonly githubService: GithubService,
  ) {}

  @Get()
  async getAllUsers(): Promise<UsersResponse> {
    const users = await this.userService.find();
    return UserMapper.getUsersResponse(users);
  }

  @Get(':username')
  async getByUsername(
    @Param('username') username: string,
  ): Promise<FullUserResponse> {
    const user = (await this.userService.findByUsername(
      username,
      true,
    )) as FullUser;

    const response = UserMapper.getFullUserResponse(user);

    if (user.githubUsername) {
      const systemToken = this.configService.github.systemToken;
      const { insights } = await this.githubService.getProfileData(systemToken, user.githubUsername);
      response.githubInsights = insights;
    }

    return response;
  }

  @Patch()
  @Access()
  async update(
    @UserRequest() user: UserResponse,
    @Body() body: UpdateUserDTO,
  ): Promise<UserResponse> {
    const updatedUser = await this.userService.updateProfile(user.id, body);
    return UserMapper.getUserResponse(updatedUser);
  }
}