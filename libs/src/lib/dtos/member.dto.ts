import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export enum MemberStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  LEFT = 'LEFT',
}

export enum MemberType {
  INVITATION = 'INVITATION',
  REQUEST = 'REQUEST',
}

export class JoinRequestDTO {
  @IsString()
  @IsNotEmpty()
    roleName: string;

  @IsString()
  @IsOptional()
    message?: string;
}

export class InviteUserDTO extends JoinRequestDTO {
  @IsUUID()
    userId: string;
}
