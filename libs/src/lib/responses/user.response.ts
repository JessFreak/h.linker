export class UserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string | null;
  githubId: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export class UsersResponse {
  users: UserResponse[];
}