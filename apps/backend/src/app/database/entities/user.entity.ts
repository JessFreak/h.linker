import { User, UserCategory } from '@prisma/client';

export type UserWithCategories = User & {
  categories?: UserCategory[];
};
