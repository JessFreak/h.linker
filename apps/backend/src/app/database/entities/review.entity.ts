import { Prisma } from '@prisma/client';

export type ReviewUpsertData = Pick<
  Prisma.ReviewUncheckedCreateInput,
  'summary' | 'strengths' | 'weaknesses'
>;
