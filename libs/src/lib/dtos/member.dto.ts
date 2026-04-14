import {
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { UserTeamType } from '@prisma/client';

export class AddMemberDTO {
  @IsUUID()
    userId: string;

  @IsString()
  @IsNotEmpty()
    roleName: string

  @IsEnum(UserTeamType)
    type: UserTeamType;

  @IsString()
  @IsOptional()
    message?: string;
}
