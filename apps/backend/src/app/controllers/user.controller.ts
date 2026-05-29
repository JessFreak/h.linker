import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Access } from '../../config/security/decorators/access';
import { UserRequest } from '../../config/security/decorators/user-request';
import {
  FullUserResponse,
  PageResponse,
  UpdateUserDTO,
  UserQueryDTO,
  UserResponse,
} from '@h.linker/libs';
import { UserMapper } from '../utils/mappers/user.mapper';
import { FullUser } from '../database/entities/user.entity';
import { ConfigType } from '@nestjs/config';
import { GithubService } from '../services/github.service';
import config from '../../config/config';
import { UserByUsernamePipe } from '../utils/pipes/user-by-username.pipe';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private readonly githubService: GithubService,
  ) {}

  @Get()
  async getAll(
    @Query() query: UserQueryDTO,
  ): Promise<PageResponse<UserResponse>> {
    const pagedResult = await this.userService.getAll(query);

    const mappedData = pagedResult.data.map((user) =>
      UserMapper.getUserResponse(user),
    );

    return new PageResponse<UserResponse>(mappedData, pagedResult.meta);
  }

  @Get(':username')
  async getByUsername(
    @Param('username', UserByUsernamePipe) username: string,
  ): Promise<FullUserResponse> {
    const user = (await this.userService.findByUsername(
      username,
      true,
    )) as FullUser;

    const response = UserMapper.getFullUserResponse(user);

    if (user.githubUsername) {
      const systemToken = this.configService.github.systemToken;
      const { insights } = await this.githubService.getProfileData(
        systemToken,
        user.githubUsername,
      );
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
