import { User, UserCategory } from '@prisma/client';

export type UserWithCategories = User & {
  skills?: UserCategory[];
};
