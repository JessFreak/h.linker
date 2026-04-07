import { User } from '@prisma/client';
import { UserResponse, UsersResponse } from '@h.linker/libs';

export class UserMapper {
  static getUserResponse(user: User): UserResponse {
    if (!user) return null;
    delete user.password;
    return user;
  }

  static getUsersResponse(users: User[]): UsersResponse {
    return {
      users: users.map(this.getUserResponse),
    };
  }
}