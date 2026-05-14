import { UserResponse } from './user.response';

export enum HackathonStatus {
  DRAFT = 'DRAFT',
  REGISTRATION = 'REGISTRATION',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export interface CriterionResponse {
  id: string;
  name: string;
  weight: number;
  maxValue: number;
}

export interface JuryResponse {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
}

export interface JuryDisplay {
  id: string;
  username: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
}

export interface HackathonResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  prize: string | null;
  status: HackathonStatus;
  imageUrl: string | null;
  registrationStartDate: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
}

export interface FullHackathonResponse extends HackathonResponse {
  creator: UserResponse;
  categories: string[];
  criteria: CriterionResponse[];
  jury?: JuryResponse[];

  stats?: {
    participations: number;
  };
}

export interface HackathonsResponse {
  hackathons: FullHackathonResponse[];
}