import { HackathonStatus } from '@prisma/client';

export class Hackathon {
  id: string;
  title: string;
  description: string | null;
  status: HackathonStatus;
  startDate: Date;
  endDate: Date;
  imageUrl: string | null;
  creatorId: string;
}