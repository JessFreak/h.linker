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

export interface HackathonResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: HackathonStatus;
  imageUrl: string | null;
}

export interface FullHackathonResponse extends HackathonResponse {
  registrationStartDate: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;

  categories: string[];
  criteria?: CriterionResponse[];
  jury?: JuryResponse[];

  stats?: {
    participations: number;
  };
}

export interface HackathonsResponse {
  hackathons: HackathonResponse[];
}