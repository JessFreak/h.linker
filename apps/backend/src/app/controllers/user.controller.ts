import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Access } from '../../config/security/decorators/acces';
import { UserRequest } from '../../config/security/decorators/user-request';
import { UpdateUserDTO, UserResponse, UsersResponse } from '@h.linker/libs';
import { UserMapper } from '../utils/mappers/user.mapper';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<UsersResponse> {
    const users = await this.userService.find();
    return UserMapper.getUsersResponse(users);
  }

  @Get(':username')
  async getByUsername(
    @Param('username') username: string,
  ): Promise<UserResponse> {
    const user = await this.userService.findByUsername(username);
    return UserMapper.getUserResponse(user);
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