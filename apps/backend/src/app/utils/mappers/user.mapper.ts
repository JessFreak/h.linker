import { User } from '@prisma/client';
import { UserResponse, UsersResponse } from '@h.linker/libs';
import { UserWithCategories } from '../../database/entities/user.entity';

export class UserMapper {
  static getUserResponse(user: UserWithCategories): UserResponse {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      githubId: user.githubId,
      skills: user.skills?.map((uc) => uc.category) || [],
    };
  }

  static getUsersResponse(users: User[]): UsersResponse {
    return {
      users: users.map((user) => this.getUserResponse(user)),
    };
  }
}