export type ExternalUser = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
  password: '';
};

export type GithubUser = ExternalUser & {
  bio: string;
  skills?: string[];
};
