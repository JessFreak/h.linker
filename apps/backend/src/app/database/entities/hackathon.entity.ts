import { Category, HackathonCategory, Prisma } from '@prisma/client';

export type FullHackathon = Prisma.HackathonGetPayload<{
  include: {
    creator: true,
    categories: { include: { cat: true } };
    criteria: true;
    jury: { include: { user: true } };
    _count: { select: { participations: true } };
  };
}>;

export type HackathonCategoryWithCat = HackathonCategory & {
  cat: Category;
};