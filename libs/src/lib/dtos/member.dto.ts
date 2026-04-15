import {
  IsEnum,
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

export class AddMemberDTO {
  @IsUUID()
    userId: string;

  @IsString()
  @IsNotEmpty()
    roleName: string;

  @IsEnum(['INVITATION', 'REQUEST'])
    type: 'INVITATION' | 'REQUEST';

  @IsString()
  @IsOptional()
    message?: string;
}
