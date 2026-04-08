import { User } from '@prisma/client';
import { UserResponse, UsersResponse } from '@h.linker/libs';
import { UserWithCategories } from '../../database/entities/user.entity';

export class UserMapper {
  static getUserResponse(user: UserWithCategories): UserResponse {
    if (!user) return null;

    const { password, categories, ...userData } = user;

    return {
      ...userData,
      skills: categories?.map((uc) => uc.category) || [],
    };
  }

  static getUsersResponse(users: User[]): UsersResponse {
    return {
      users: users.map((user) => this.getUserResponse(user)),
    };
  }
}