export enum HackathonStatus {
  DRAFT = 'DRAFT',
  REGISTRATION = 'REGISTRATION',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

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