import { IsOptional, IsUUID } from 'class-validator';
import { BaseQueryDTO } from './base-query.dto';

export class TeamQueryDTO extends BaseQueryDTO {
  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsUUID()
  hackathonId?: string;
}
