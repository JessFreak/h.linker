import { HackathonStatus } from '@prisma/client';

export interface Hackathon {
  id: string;
  title: string;
  description: string | null;
  status: HackathonStatus;
  startDate: Date;
  endDate: Date;
  imageUrl: string | null;
  creatorId: string;
}